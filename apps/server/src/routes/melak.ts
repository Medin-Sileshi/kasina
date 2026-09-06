import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  generateMelakReply,
  type MelakQuestionContext,
} from "@kasina/melak-core";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireUser } from "../lib/auth-user";
import { rateLimit } from "../lib/rate-limit";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  questionId: z.string().optional(),
  sessionId: z.string().optional(),
  /** When true and a cloud/VPS endpoint is configured, try enhanced Melak. */
  online: z.boolean().optional().default(false),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
});

const MELAK_ONLINE_SYSTEM = `You are Melak (መላክ), Kasina's tutor for Ethiopian Grade 12 Mathematics.
Answer in the student's language (English or Amharic). Stay on Grade 12 Ethiopian Math curriculum.
Be concise (under 200 words). Use LaTeX: $...$ inline. Guide understanding; do not only give answers.`;

const DAILY_TURN_LIMIT = 20;
/**
 * Qwen via LM Studio often needs 15–40s (prompt + first token).
 * Aborting early caused empty `output: []` and silent offline fallback.
 */
const CLOUD_TIMEOUT_MS = 60_000;

export const melakApp = new Hono<HonoEnv>();

async function loadQuestionContext(
  db: ReturnType<typeof createDb>,
  questionId: string | undefined,
): Promise<MelakQuestionContext | null> {
  if (!questionId) return null;
  const { data: q } = await db
    .from("questions")
    .select(
      "id, stem, stem_am, unit, topic, explanation, explanation_am",
    )
    .eq("id", questionId)
    .maybeSingle();
  if (!q) return null;
  return {
    id: q.id,
    stem: q.stem,
    stemAm: q.stem_am,
    unit: q.unit,
    topic: q.topic,
    explanation: q.explanation,
    explanationAm: q.explanation_am,
  };
}

async function persistExchange(
  db: ReturnType<typeof createDb>,
  userId: string,
  body: {
    message: string;
    questionId?: string;
    sessionId?: string;
  },
  reply: string,
) {
  const userMsgId = randomUUID();
  const assistantMsgId = randomUUID();
  const { error } = await db.from("melak_messages").insert([
    {
      id: userMsgId,
      user_id: userId,
      role: "user",
      content: body.message,
      question_id: body.questionId ?? null,
      session_id: body.sessionId ?? null,
    },
    {
      id: assistantMsgId,
      user_id: userId,
      role: "assistant",
      content: reply,
      question_id: body.questionId ?? null,
      session_id: body.sessionId ?? null,
    },
  ]);
  if (error) console.error("[melak] persist error:", error.message);
}

function llmChatUrl(base: string): string {
  const trimmed = base.replace(/\/$/, "");
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  if (/\/v1$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
}

function offlineReply(
  message: string,
  question: MelakQuestionContext | null,
) {
  return generateMelakReply({ message, question }).reply;
}

function buildCloudInput(
  message: string,
  question: MelakQuestionContext | null,
  history: Array<{ role: "user" | "assistant"; content: string }> | undefined,
): string {
  let grounding = "";
  if (question) {
    grounding = `\n\nQuestion context:\nUnit: ${question.unit}\nTopic: ${question.topic}\nStem: ${question.stem}\nExplanation hint: ${question.explanation}`;
  }
  const hist = (history ?? [])
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Student" : "Melak"}: ${m.content}`)
    .join("\n");
  return [
    MELAK_ONLINE_SYSTEM + grounding,
    hist ? `\nRecent conversation:\n${hist}` : "",
    `\nStudent: ${message}\nMelak:`,
  ]
    .filter(Boolean)
    .join("\n");
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (!part || typeof part !== "object") return "";
        const p = part as { type?: string; text?: string; content?: string };
        if (typeof p.text === "string") return p.text;
        if (typeof p.content === "string") return p.content;
        return "";
      })
      .join("")
      .trim();
  }
  return "";
}

/** Take everything useful from an LM Studio / OpenAI-shaped payload. */
function extractLmStudioReply(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const output = (payload as { output?: unknown }).output;
  if (Array.isArray(output)) {
    const parts: string[] = [];
    for (const item of output) {
      if (!item || typeof item !== "object") continue;
      const row = item as { type?: string; content?: unknown; text?: unknown };
      // Prefer message content; also accept plain text / output_text rows.
      if (row.type === "message" || row.type === "text" || row.type == null) {
        const text =
          contentToText(row.content) ||
          (typeof row.text === "string" ? row.text.trim() : "");
        if (text) parts.push(text);
      }
    }
    if (parts.length) return parts.join("\n\n").trim();
  }
  // Top-level content / message (some gateways)
  const top = payload as {
    content?: unknown;
    message?: string | { content?: unknown };
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const topContent = contentToText(top.content);
  if (topContent) return topContent;
  if (typeof top.message === "string" && top.message.trim()) {
    return top.message.trim();
  }
  if (top.message && typeof top.message === "object") {
    const nested = contentToText(top.message.content);
    if (nested) return nested;
  }
  const openAi = contentToText(top.choices?.[0]?.message?.content);
  return openAi || null;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * LM Studio native REST: POST /api/v1/chat with { model, input, store, … }.
 * See https://lmstudio.ai/docs/developer/rest/chat
 */
async function tryLmStudioCloud(
  env: ServerEnv,
  endpoint: string,
  message: string,
  question: MelakQuestionContext | null,
  history: Array<{ role: "user" | "assistant"; content: string }> | undefined,
): Promise<string | null> {
  const model =
    env.MELAK_LLM_MODEL?.trim() || "qwen/qwen3.5-9b";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (env.MELAK_LLM_API_KEY) {
    headers.Authorization = `Bearer ${env.MELAK_LLM_API_KEY}`;
  }

  try {
    const res = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          input: buildCloudInput(message, question, history),
          store: false,
          stream: false,
          reasoning: "off",
          temperature: 0.3,
          // Prefer longer completions so curriculum answers are not cut off.
          max_output_tokens: 1024,
        }),
      },
      CLOUD_TIMEOUT_MS,
    );
    if (!res.ok) {
      console.error(
        "[melak] MELAK_CLOUD_ENDPOINT error:",
        res.status,
        await res.text(),
      );
      return null;
    }
    const payload: unknown = await res.json();
    return extractLmStudioReply(payload);
  } catch (err) {
    console.error(
      "[melak] MELAK_CLOUD_ENDPOINT failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

async function tryOpenAiCompatible(
  env: ServerEnv,
  base: string,
  message: string,
  question: MelakQuestionContext | null,
  history: Array<{ role: "user" | "assistant"; content: string }> | undefined,
): Promise<string | null> {
  let grounding = "";
  if (question) {
    grounding = `\n\nQuestion context:\nUnit: ${question.unit}\nTopic: ${question.topic}\nStem: ${question.stem}\nExplanation hint: ${question.explanation}`;
  }
  const model = env.MELAK_LLM_MODEL?.trim() || "melak";
  const messages = [
    { role: "system" as const, content: MELAK_ONLINE_SYSTEM + grounding },
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (env.MELAK_LLM_API_KEY) {
    headers.Authorization = `Bearer ${env.MELAK_LLM_API_KEY}`;
  }

  try {
    const res = await fetchWithTimeout(
      llmChatUrl(base),
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          max_tokens: 512,
          messages,
        }),
      },
      CLOUD_TIMEOUT_MS,
    );
    if (!res.ok) {
      console.error("[melak] llm error:", res.status, await res.text());
      return null;
    }
    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return payload.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error(
      "[melak] llm fetch error:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

melakApp.get("/context/:questionId", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const db = createDb(c.env);
  const ctx = await loadQuestionContext(db, c.req.param("questionId"));
  if (!ctx) return c.json({ error: "Question not found" }, 404);
  return c.json({ question: ctx });
});

melakApp.post("/chat", zValidator("json", chatSchema), async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const rl = rateLimit({
    key: `melak:${user.id}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return c.json(
      { error: `Too many messages. Try again in ${rl.retryAfterSec}s.` },
      429,
    );
  }

  const body = c.req.valid("json");
  const db = createDb(c.env);

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count: todayCount, error: countErr } = await db
    .from("melak_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "user")
    .gte("created_at", dayStart.toISOString());

  if (countErr) return c.json({ error: countErr.message }, 500);
  if ((todayCount ?? 0) >= DAILY_TURN_LIMIT) {
    return c.json(
      {
        error: `Daily Melak limit reached (${DAILY_TURN_LIMIT} messages). Resets at midnight UTC.`,
      },
      429,
    );
  }

  const question = await loadQuestionContext(db, body.questionId);
  const cloudEndpoint = c.env.MELAK_CLOUD_ENDPOINT?.trim();
  const llmBase = c.env.MELAK_LLM_BASE_URL?.trim();
  const turnsRemaining = Math.max(
    0,
    DAILY_TURN_LIMIT - (todayCount ?? 0) - 1,
  );

  const respondOffline = async (pilotNote: string) => {
    const reply = offlineReply(body.message, question);
    await persistExchange(db, user.id, body, reply);
    return c.json({
      message: reply,
      mode: "offline" as const,
      turnsRemaining,
      pilotNote,
    });
  };

  if (!body.online || (!cloudEndpoint && !llmBase)) {
    return respondOffline(
      "Melak on-device — lightweight tutor. No cloud AI needed.",
    );
  }

  let enhanced: string | null = null;
  if (cloudEndpoint) {
    enhanced = await tryLmStudioCloud(
      c.env,
      cloudEndpoint,
      body.message,
      question,
      body.history,
    );
  } else if (llmBase) {
    enhanced = await tryOpenAiCompatible(
      c.env,
      llmBase,
      body.message,
      question,
      body.history,
    );
  }

  if (!enhanced) {
    return respondOffline(
      "Enhanced model timed out or returned empty — showing on-device Melak. Try again; Qwen can take 20–40s on first tokens.",
    );
  }

  await persistExchange(db, user.id, body, enhanced);
  return c.json({
    message: enhanced,
    mode: "online" as const,
    turnsRemaining,
    pilotNote: cloudEndpoint
      ? "Enhanced Melak (demo bridge). Switch off for on-device-only."
      : "Enhanced Melak (Kasina VPS). Switch off for on-device-only mode.",
  });
});

melakApp.get("/history", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const db = createDb(c.env);
  const { data, error } = await db
    .from("melak_messages")
    .select("id, role, content, question_id, session_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(40);

  if (error) return c.json({ error: error.message }, 500);

  return c.json({
    messages: (data ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      questionId: m.question_id,
      sessionId: m.session_id,
      createdAt: m.created_at,
    })),
  });
});
