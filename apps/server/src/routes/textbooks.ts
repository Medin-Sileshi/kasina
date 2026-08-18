import { Hono } from "hono";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireUser } from "../lib/auth-user";
import catalog from "../data/textbooks.json";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

type Book = (typeof catalog.books)[number];

export const textbooksApp = new Hono<HonoEnv>();

const SUBJECTS = new Set(catalog.books.map((b) => b.subject));

function r2Prefix(subject: string) {
  return `textbooks/grade-12/${subject}`;
}

function contentTypeFor(key: string): string {
  if (key.endsWith(".json")) return "application/json; charset=utf-8";
  if (key.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

async function readKey(env: ServerEnv, key: string) {
  const bucket = env.TEXTBOOKS;
  if (!bucket) return null;
  const object = await bucket.get(key);
  if (!object?.body) return null;
  return object;
}

async function readText(env: ServerEnv, key: string): Promise<string | null> {
  const object = await readKey(env, key);
  if (!object) return null;
  const body = object.body;
  if (typeof body === "string") return body;
  if (body instanceof Uint8Array) return new TextDecoder().decode(body);
  return await new Response(body as ReadableStream).text();
}

textbooksApp.get("/", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const books = [];
  for (const b of catalog.books) {
    const indexText = await readText(c.env, `${r2Prefix(b.subject)}/index.json`);
    books.push({
      id: b.id,
      grade: b.grade,
      subject: b.subject,
      title: b.title,
      edition: b.edition,
      mvpStatus: b.mvpStatus,
      readable: Boolean(indexText),
    });
  }

  return c.json({
    curriculum: catalog.curriculum,
    books,
  });
});

textbooksApp.get("/grade-12/:subject", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const subject = c.req.param("subject").toLowerCase();
  if (!SUBJECTS.has(subject as Book["subject"])) {
    return c.json({ error: "Textbook not found" }, 404);
  }

  const text = await readText(c.env, `${r2Prefix(subject)}/index.json`);
  if (!text) {
    return c.json(
      { error: "This textbook is not available to read online yet." },
      404,
    );
  }
  return c.json(JSON.parse(text));
});

textbooksApp.get("/grade-12/:subject/chapters/:chapter", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const subject = c.req.param("subject").toLowerCase();
  const chapter = c.req.param("chapter").replace(/[^a-z0-9-]/g, "");
  if (!SUBJECTS.has(subject as Book["subject"]) || !chapter) {
    return c.json({ error: "Not found" }, 404);
  }

  const markdown = await readText(
    c.env,
    `${r2Prefix(subject)}/chapters/${chapter}.md`,
  );
  if (!markdown) return c.json({ error: "Chapter not found" }, 404);

  return c.json({ subject, chapter, markdown });
});

textbooksApp.get("/grade-12/:subject/pages/:file", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const subject = c.req.param("subject").toLowerCase();
  const file = c.req.param("file");
  if (!SUBJECTS.has(subject as Book["subject"])) {
    return c.json({ error: "Not found" }, 404);
  }
  if (!/^p\d{3}\.(webp|jpg|jpeg|png)$/.test(file)) {
    return c.json({ error: "Invalid page" }, 400);
  }

  const object = await readKey(c.env, `${r2Prefix(subject)}/pages/${file}`);
  if (!object) return c.json({ error: "Page not found" }, 404);

  const headers = new Headers();
  headers.set("Content-Type", contentTypeFor(file));
  headers.set("Content-Disposition", "inline");
  headers.set("Cache-Control", "private, max-age=86400");
  headers.set("X-Content-Type-Options", "nosniff");
  if (object.size != null) headers.set("Content-Length", String(object.size));
  return new Response(object.body as ReadableStream | Uint8Array, { headers });
});
