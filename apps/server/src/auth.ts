import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import type { ServerEnv } from "./env";
import { createDb } from "./db";
import { sendSms } from "./lib/sms";

type Auth = ReturnType<typeof buildAuth>;

let cached: { key: string; auth: Auth; pool: Pool } | null = null;

export function isTransientPgError(err: unknown): boolean {
  if (!err || typeof err !== "object") {
    return /ECONNRESET|Connection terminated|connection timeout|ENOTFOUND|ECONNREFUSED/i.test(
      String(err),
    );
  }
  const code = "code" in err ? String(err.code) : "";
  const message = "message" in err ? String(err.message) : String(err);
  return (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "57P01" ||
    /ECONNRESET|Connection terminated|connection timeout|server closed the connection|ENOTFOUND|getaddrinfo/i.test(
      message,
    )
  );
}

export async function withPgRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (!isTransientPgError(err) || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 250 * (i + 1)));
    }
  }
  throw last;
}

function allowLocalOrigins(env: { APP_URL?: string; ALLOW_LOCAL_ORIGINS?: string }) {
  if (env.ALLOW_LOCAL_ORIGINS === "true" || env.ALLOW_LOCAL_ORIGINS === "1") {
    return true;
  }
  const app = (env.APP_URL ?? "").trim().toLowerCase();
  return (
    app.startsWith("http://localhost") ||
    app.startsWith("http://127.0.0.1")
  );
}

function appOrigins(env: ServerEnv): string[] {
  const origins = new Set<string>([
    env.APP_URL,
    "https://kasina.et",
    "https://www.kasina.et",
  ]);
  if (allowLocalOrigins(env)) {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return [...origins].filter(Boolean);
}

function buildAuth(env: ServerEnv, pool: Pool) {
  const isHttps = env.BETTER_AUTH_URL.startsWith("https://");
  return betterAuth({
    database: pool,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: appOrigins(env),
    ...(isHttps
      ? {
          advanced: {
            useSecureCookies: true,
            defaultCookieAttributes: {
              sameSite: "none" as const,
              secure: true,
            },
          },
        }
      : {}),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "student",
          input: false,
        },
        approvalStatus: {
          type: "string",
          required: false,
          defaultValue: "approved",
          fieldName: "approval_status",
          input: false,
          returned: true,
        },
        schoolId: {
          type: "string",
          required: false,
          fieldName: "school_id",
          input: false,
          returned: true,
        },
      },
    },
    plugins: [
      phoneNumber({
        // Map plugin fields onto migration columns (phone / phoneVerified)
        schema: {
          user: {
            fields: {
              phoneNumber: "phone",
              phoneNumberVerified: "phoneVerified",
            },
          },
        },
        sendOTP: async ({ phoneNumber: phone, code }) => {
          const message = `Kasina code: ${code}`;
          const result = await sendSms(env, { to: phone, message });
          const db = createDb(env);
          const status = result.ok
            ? "sent"
            : result.mocked
              ? "pending"
              : "failed";
          const { error } = await db.from("otp_send_log").insert({
            id: randomUUID(),
            phone,
            purpose: "login",
            status,
            code_hint: code.slice(-2),
            error: result.error ?? (result.mocked ? "SMS gateway not configured" : null),
          });
          if (error) {
            console.error("[auth] otp_send_log insert failed:", error.message);
          }
        },
      }),
    ],
  });
}

function isPoolerUrl(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    return (
      url.hostname.includes("pooler.supabase.com") || url.port === "6543"
    );
  } catch {
    return databaseUrl.includes("pooler.supabase.com");
  }
}

export function createAuth(env: ServerEnv) {
  const databaseUrl = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL or HYPERDRIVE binding is required for Better Auth",
    );
  }

  const viaHyperdrive = Boolean(env.HYPERDRIVE?.connectionString);

  // Hyperdrive owns the real pool. Do not cache a Worker-side Pool across
  // requests — reused sockets cause intermittent Error 1101 crashes.
  if (viaHyperdrive) {
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      min: 0,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 15_000,
      allowExitOnIdle: true,
    });
    pool.on("error", (err) => {
      console.error("[auth-pool] hyperdrive client error:", err.message);
    });
    return buildAuth(env, pool);
  }

  const key = `${databaseUrl}|${env.BETTER_AUTH_SECRET}|${env.BETTER_AUTH_URL}`;
  if (cached?.key === key) {
    return cached.auth;
  }

  if (cached?.pool) {
    void cached.pool.end().catch(() => undefined);
  }

  const pooler = isPoolerUrl(databaseUrl);

  // Session-mode Supabase pooler (local Node): max 1 to avoid resets.
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    min: 0,
    idleTimeoutMillis: pooler ? 5_000 : 30_000,
    connectionTimeoutMillis: 20_000,
    allowExitOnIdle: true,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
    ssl: databaseUrl.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });

  pool.on("error", (err) => {
    console.error("[auth-pool] idle client error:", err.message);
    if (cached?.pool === pool) {
      cached = null;
    }
  });

  const auth = buildAuth(env, pool);
  cached = { key, auth, pool };
  return auth;
}

/** Force a new Pool on the next createAuth() — use after connection deaths. */
export function resetAuthCache() {
  const prev = cached;
  cached = null;
  if (prev?.pool) {
    void prev.pool.end().catch(() => undefined);
  }
}

export type { Auth };
