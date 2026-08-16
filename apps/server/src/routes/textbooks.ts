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

function findBook(subject: string): Book | undefined {
  return catalog.books.find((b) => b.subject === subject && b.grade === 12);
}

/** Catalog for authenticated users. MVP highlights mathematics as active. */
textbooksApp.get("/", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const books = catalog.books.map((b) => ({
    id: b.id,
    grade: b.grade,
    subject: b.subject,
    title: b.title,
    edition: b.edition,
    mvpStatus: b.mvpStatus,
    available: Boolean(c.env.TEXTBOOKS),
  }));

  return c.json({
    bucket: catalog.bucket,
    curriculum: catalog.curriculum,
    books,
  });
});

/**
 * Stream a Grade 12 textbook PDF from R2.
 * MVP: mathematics is active. Other subjects are stored but only teachers/admins
 * may download them (prep for multi-subject; not in student pilot UI).
 */
textbooksApp.get("/grade-12/:subject", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const subject = c.req.param("subject").toLowerCase();
  const book = findBook(subject);
  if (!book) {
    return c.json({ error: "Textbook not found" }, 404);
  }

  if (book.mvpStatus !== "active" && user.role === "student") {
    return c.json(
      {
        error:
          "This subject is not part of the Grade 12 Mathematics pilot yet. Ask your teacher if you need access later.",
      },
      403,
    );
  }

  const bucket = c.env.TEXTBOOKS;
  if (!bucket) {
    return c.json(
      {
        error:
          "Textbook storage is not configured on this server (missing TEXTBOOKS R2 binding).",
      },
      503,
    );
  }

  const object = await bucket.get(book.r2Key);
  if (!object) {
    return c.json(
      {
        error: "Textbook file is missing from storage. Re-run the R2 upload script.",
        key: book.r2Key,
      },
      404,
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set(
    "Content-Disposition",
    `inline; filename="kasina-grade-12-${book.subject}.pdf"`,
  );
  headers.set("Cache-Control", "private, max-age=3600");
  if (object.size != null) {
    headers.set("Content-Length", String(object.size));
  }
  object.writeHttpMetadata(headers);
  if (object.httpEtag) headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
});
