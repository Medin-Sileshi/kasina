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
  /** When true and ANTHROPIC_API_KEY is set, use cloud tutor (heavier). Default: offline. */
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

const MELAK_ONLINE_SYSTEM = `You are Melak (መላክ), Kasina's AI tutor for Ethiopian Grade 12 Mathematics.
Answer in the student's language (English or Amharic). Stay on Grade 12 Ethiopian Math curriculum.
Be concise (under 200 words). Use LaTeX: $...$ inline. Guide understanding; do not only give answers.`;

const DAILY_TURN_LIMIT = 20;

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

  // Default: lightweight offline tutor (no external API)
  if (!body.online || !c.env.ANTHROPIC_API_KEY) {
    const { reply } = generateMelakReply({
      message: body.message,
      question,
    });
    await persistExchange(db, user.id, body, reply);
    return c.json({
      message: reply,
      mode: "offline" as const,
      turnsRemaining: Math.max(0, DAILY_TURN_LIMIT - (todayCount ?? 0) - 1),
      pilotNote:
        "Melak offline — lightweight tutor on your device. No cloud AI needed.",
    });
  }

  // Optional online enhancement (Haiku — smaller/faster than Sonnet)
  let grounding = "";
  if (question) {
    grounding = `\n\nQuestion context:\nUnit: ${question.unit}\nTopic: ${question.topic}\nStem: ${question.stem}\nExplanation hint: ${question.explanation}`;
  }

  const messages = [
    ...(body.history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: body.message },
  ];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": c.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 512,
      system: MELAK_ONLINE_SYSTEM + grounding,
      messages,
    }),
  });

  if (!res.ok) {
    console.error("[melak] anthropic error:", res.status, await res.text());
    const { reply } = generateMelakReply({
      message: body.message,
      question,
    });
    await persistExchange(db, user.id, body, reply);
    return c.json({
      message: reply,
      mode: "offline" as const,
      turnsRemaining: Math.max(0, DAILY_TURN_LIMIT - (todayCount ?? 0) - 1),
      pilotNote: "Cloud tutor unavailable — using offline Melak instead.",
    });
  }

  const payload = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const reply =
    payload.content.find((b) => b.type === "text")?.text?.trim() ??
    generateMelakReply({ message: body.message, question }).reply;

  await persistExchange(db, user.id, body, reply);

  return c.json({
    message: reply,
    mode: "online" as const,
    turnsRemaining: Math.max(0, DAILY_TURN_LIMIT - (todayCount ?? 0) - 1),
    pilotNote: "Online tutor (needs connection). Switch off for offline mode.",
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
