import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, isTransientPgError, resetAuthCache } from "./auth";
import { createDb, pingDb } from "./db";
import type { AppVariables, ServerEnv } from "./env";
import { getSessionCached } from "./lib/auth-user";
import { assignmentsApp } from "./routes/assignments";
import { classesApp } from "./routes/classes";
import { progressApp } from "./routes/progress";
import { sessionsApp } from "./routes/sessions";
import { subjectsApp } from "./routes/subjects";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const app = new Hono<HonoEnv>();

app.use("*", async (c, next) => {
  const allowed = new Set(
    [
      c.env.APP_URL,
      "http://localhost:3000",
      "https://kasina.et",
      "https://www.kasina.et",
    ].filter(Boolean),
  );
  return cors({
    origin: (origin) => (origin && allowed.has(origin) ? origin : null),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })(c, next);
});

app.get("/", (c) => c.json({ name: "kasina-server", status: "ok" }));

app.get("/health", async (c) => {
  try {
    const db = createDb(c.env);
    const ok = await pingDb(db);
    if (!ok) {
      return c.json(
        {
          ok: false,
          db: false,
          hint: "Supabase REST unreachable or schema missing. Check SUPABASE_* and that the project is not paused.",
        },
        503,
      );
    }
    return c.json({ ok: true, db: true });
  } catch (err) {
    return c.json(
      {
        ok: false,
        db: false,
        hint:
          err instanceof Error
            ? err.message
            : "Database health check failed",
      },
      500,
    );
  }
});

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const raw = c.req.raw;
  let last: Response | undefined;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const auth = createAuth(c.env);
      const res = await auth.handler(raw.clone());
      if (res.status < 500) return res;

      const body = await res.clone().text();
      const retryable =
        !body ||
        /ECONNRESET|Connection terminated|connection timeout|ENOTFOUND|ECONNREFUSED|SERVER_ERROR|INTERNAL_SERVER_ERROR/i.test(
          body,
        );

      if (!retryable || attempt === 2) {
        if (res.status >= 500 && !body) {
          return new Response(
            JSON.stringify({
              error:
                "Cannot reach the database. Check your connection, that Supabase is not paused, and that DATABASE_URL in apps/server/.dev.vars is correct.",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        return res;
      }

      last = res;
      resetAuthCache();
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    } catch (err) {
      console.error(
        "[auth] handler error:",
        err instanceof Error ? err.message : err,
      );
      if (!isTransientPgError(err) || attempt === 2) {
        return new Response(
          JSON.stringify({
            error:
              err instanceof Error
                ? err.message
                : "Auth temporarily unavailable",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      resetAuthCache();
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }

  return (
    last ??
    new Response(JSON.stringify({ error: "Auth temporarily unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  );
});

app.get("/me", async (c) => {
  const auth = createAuth(c.env);
  const db = createDb(c.env);
  let session: Awaited<ReturnType<typeof getSessionCached>>;
  try {
    session = await getSessionCached(auth, c.req.raw.headers);
  } catch (err) {
    console.error(
      "[auth] /me getSession failed:",
      err instanceof Error ? err.message : err,
    );
    return c.json({ error: "Auth temporarily unavailable" }, 503);
  }
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const user = session.user as {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  const role = (user.role ?? "student") as "student" | "teacher" | "admin";

  let classes: Array<{
    id: string;
    name: string;
    grade: number;
    subject: string;
    inviteCode: string;
  }> = [];

  if (role === "teacher") {
    const { data } = await db
      .from("classes")
      .select("id, name, grade, subject, invite_code")
      .eq("teacher_id", user.id);
    classes =
      data?.map((row) => ({
        id: row.id,
        name: row.name,
        grade: row.grade,
        subject: row.subject,
        inviteCode: row.invite_code,
      })) ?? [];
  } else {
    const { data: memberships } = await db
      .from("class_members")
      .select("class_id")
      .eq("student_id", user.id);
    const ids = memberships?.map((m) => m.class_id) ?? [];
    if (ids.length) {
      const { data } = await db
        .from("classes")
        .select("id, name, grade, subject, invite_code")
        .in("id", ids);
      classes =
        data?.map((row) => ({
          id: row.id,
          name: row.name,
          grade: row.grade,
          subject: row.subject,
          inviteCode: row.invite_code,
        })) ?? [];
    }
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    },
    classes,
  });
});

app.get("/questions", async (c) => {
  const auth = createAuth(c.env);
  const db = createDb(c.env);
  let session: Awaited<ReturnType<typeof getSessionCached>>;
  try {
    session = await getSessionCached(auth, c.req.raw.headers);
  } catch (err) {
    console.error(
      "[auth] /questions getSession failed:",
      err instanceof Error ? err.message : err,
    );
    return c.json({ error: "Auth temporarily unavailable" }, 503);
  }
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const subject = c.req.query("subject") ?? "mathematics";
  const grade = Number(c.req.query("grade") ?? "12");

  const { data, error } = await db
    .from("questions")
    .select(
      "id, grade, subject, stream, year, unit, topic, stem, stem_am, options_json, correct_option_id, explanation, explanation_am, difficulty, tags_json",
    )
    .eq("subject", subject)
    .eq("grade", grade)
    .order("unit", { ascending: true });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const questions =
    data?.map((row) => ({
      id: row.id,
      grade: row.grade,
      subject: row.subject,
      stream: row.stream,
      year: row.year,
      unit: row.unit,
      topic: row.topic,
      stem: row.stem,
      stemAm: row.stem_am,
      options: row.options_json,
      correctOptionId: row.correct_option_id,
      explanation: row.explanation,
      explanationAm: row.explanation_am,
      difficulty: row.difficulty,
      tags: row.tags_json,
    })) ?? [];

  return c.json({ count: questions.length, questions });
});

app.route("/classes", classesApp);
app.route("/assignments", assignmentsApp);
app.route("/sessions", sessionsApp);
app.route("/progress", progressApp);
app.route("/subjects", subjectsApp);

export default app;
