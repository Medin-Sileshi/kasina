/**
 * One-shot: create Medin Sileshi admin (medin@kasina.com).
 * Password from MEDIN_ADMIN_PASSWORD env, or argv[2], or generated.
 *
 * Usage (from repo root):
 *   MEDIN_ADMIN_PASSWORD='…' pnpm --filter server exec tsx scripts/create-medin-admin.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { createAuth } from "../src/auth";
import { createDb } from "../src/db";
import { unwrapAuthUser } from "../src/lib/auth-signup";
import type { ServerEnv } from "../src/env";

function loadDevVars(): Record<string, string> {
  const out: Record<string, string> = { ...process.env } as Record<
    string,
    string
  >;
  for (const rel of ["apps/server/.dev.vars", ".env", "apps/server/.env"]) {
    const path = resolve(process.cwd(), rel);
    // Also try from apps/server cwd
    const alt = resolve(process.cwd(), "..", "..", rel);
    for (const p of [path, alt, resolve(import.meta.dirname, "../.dev.vars")]) {
      if (!existsSync(p)) continue;
      for (const line of readFileSync(p, "utf8").split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#") || !t.includes("=")) continue;
        const i = t.indexOf("=");
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        if (!(k in out) || !out[k]) out[k] = v;
      }
    }
  }
  return out;
}

function genPassword(len = 9): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i += 1) {
    s += alphabet[bytes[i]! % alphabet.length]!;
  }
  return s;
}

const EMAIL = "medin@kasina.com";
const NAME = "Medin Sileshi";

async function main() {
  const envMap = loadDevVars();
  const password =
    process.env.MEDIN_ADMIN_PASSWORD?.trim() ||
    process.argv[2]?.trim() ||
    genPassword(9);

  const env = {
    SUPABASE_URL: envMap.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: envMap.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: envMap.DATABASE_URL,
    BETTER_AUTH_SECRET: envMap.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: envMap.BETTER_AUTH_URL || "http://localhost:8787",
    APP_URL: envMap.APP_URL || "http://localhost:3000",
  } as ServerEnv;

  if (!env.DATABASE_URL || !env.BETTER_AUTH_SECRET) {
    console.error("Need DATABASE_URL and BETTER_AUTH_SECRET in .dev.vars");
    process.exit(1);
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const db = createDb(env);
  const { data: existing } = await db
    .from("user")
    .select("id, email, role, approval_status")
    .eq("email", EMAIL)
    .maybeSingle();

  if (existing) {
    const { error } = await db
      .from("user")
      .update({
        name: NAME,
        role: "admin",
        approval_status: "approved",
      })
      .eq("id", existing.id);
    if (error) {
      console.error("Failed to promote existing user:", error.message);
      process.exit(1);
    }
    console.log(
      JSON.stringify(
        {
          status: "updated_existing",
          email: EMAIL,
          name: NAME,
          role: "admin",
          id: existing.id,
          note: "Password unchanged — set MEDIN_ADMIN_PASSWORD and delete the user to recreate, or reset via Better Auth.",
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  const auth = createAuth(env);
  const signUp = await auth.api.signUpEmail({
    body: {
      email: EMAIL,
      password,
      name: NAME,
    },
    asResponse: false,
    returnHeaders: true,
  });
  const { userId } = unwrapAuthUser(signUp);

  const { error: roleErr } = await db
    .from("user")
    .update({
      role: "admin",
      approval_status: "approved",
      name: NAME,
    })
    .eq("id", userId);
  if (roleErr) {
    console.error("Signed up but failed to set admin role:", roleErr.message);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        status: "created",
        email: EMAIL,
        name: NAME,
        role: "admin",
        id: userId,
        password,
        login: "/medin/login",
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
