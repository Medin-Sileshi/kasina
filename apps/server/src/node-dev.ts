import { serve } from "@hono/node-server";
import { readFileSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import app from "./index";
import type { ServerEnv } from "./env";

function loadDevVars(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    out[trimmed.slice(0, i)] = trimmed.slice(i + 1);
  }
  return out;
}

const env = {
  ...process.env,
  ...loadDevVars(resolve(import.meta.dirname, "../.dev.vars")),
} as unknown as ServerEnv;

const textbooksRoot = resolve(import.meta.dirname, "../../../content/textbooks/md/grade-12");
env.TEXTBOOKS = {
  async get(key: string) {
    try {
      const rel = key.replace(/^textbooks\/grade-12\//, "");
      const buf = await readFile(resolve(textbooksRoot, rel));
      return { body: buf, size: buf.byteLength };
    } catch {
      return null;
    }
  },
};

const missing = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "APP_URL",
].filter((k) => !env[k as keyof ServerEnv]);

if (missing.length) {
  console.error("Missing env:", missing.join(", "));
  process.exit(1);
}

const port = Number(process.env.PORT ?? 8787);

console.log(`Kasina API (Node) on http://localhost:${port}`);
const server = serve({
  fetch: (request) => app.fetch(request, env),
  port,
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the other process or set PORT=…`,
    );
    process.exit(1);
  }
  throw err;
});
