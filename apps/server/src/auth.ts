import { betterAuth } from "better-auth";
import { Pool } from "pg";
import type { ServerEnv } from "./env";

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

function appOrigins(env: ServerEnv): string[] {
  const origins = new Set<string>([
    env.APP_URL,
    "http://localhost:3000",
    "https://kasina.et",
    "https://www.kasina.et",
  ]);
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
          input: true,
        },
      },
    },
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
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Better Auth");
  }

  const key = `${env.DATABASE_URL}|${env.BETTER_AUTH_SECRET}|${env.BETTER_AUTH_URL}`;
  if (cached?.key === key) {
    return cached.auth;
  }

  if (cached?.pool) {
    void cached.pool.end().catch(() => undefined);
  }

  const pooler = isPoolerUrl(env.DATABASE_URL);

  // Session-mode Supabase pooler: keep a single client. Concurrent sockets get
  // reset (ECONNRESET / Connection terminated) and break getSession/sign-in.
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 1,
    min: 0,
    idleTimeoutMillis: pooler ? 5_000 : 30_000,
    connectionTimeoutMillis: 20_000,
    allowExitOnIdle: true,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
    ssl: env.DATABASE_URL.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });

  pool.on("error", (err) => {
    console.error("[auth-pool] idle client error:", err.message);
    // Drop the dead pool so the next request opens a fresh connection.
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
