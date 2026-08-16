/**
 * Reset / reseed pilot class content.
 *
 * Usage (from repo root, with env loaded):
 *   set -a && . apps/server/.dev.vars && set +a
 *   node --import tsx packages/db/scripts/reset-pilot.ts
 *
 * What it does:
 * - Upserts all questions from the seed bank (same as seed)
 * - Ensures DEMO2026 class exists for DEMO_TEACHER_EMAIL
 * - Does NOT delete student accounts or practice history
 *   (safe for mid-pilot content refresh)
 *
 * For a hard wipe of answers/sessions, run SQL manually in Supabase:
 *   TRUNCATE answers, practice_sessions RESTART IDENTITY CASCADE;
 * (Keep user/classes unless you intentionally want a full reset.)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DEMO_INVITE_CODE, DEMO_TEACHER_EMAIL } from "../src/index";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const seedPath = resolve(
    import.meta.dirname,
    "../../question-bank/data/grade12-math-seed.json",
  );
  const questions = JSON.parse(readFileSync(seedPath, "utf8")) as Array<{
    id: string;
    grade: number;
    subject: string;
    stream?: string;
    year?: number;
    unit: string;
    topic: string;
    stem: string;
    stemAm?: string;
    options: unknown;
    correctOptionId: string;
    explanation: string;
    explanationAm?: string;
    difficulty?: string;
    tags?: string[];
  }>;

  const rows = questions.map((q) => ({
    id: q.id,
    grade: q.grade,
    subject: q.subject,
    stream: q.stream ?? null,
    year: q.year ?? null,
    unit: q.unit,
    topic: q.topic,
    stem: q.stem,
    stem_am: q.stemAm ?? null,
    options_json: q.options,
    correct_option_id: q.correctOptionId,
    explanation: q.explanation,
    explanation_am: q.explanationAm ?? null,
    difficulty: q.difficulty ?? null,
    tags_json: q.tags ?? null,
  }));

  const { error: qErr } = await supabase.from("questions").upsert(rows);
  if (qErr) {
    console.error("Question upsert failed:", qErr.message);
    process.exit(1);
  }
  console.log(`Upserted ${rows.length} questions`);

  const { data: teacher } = await supabase
    .from("user")
    .select("id, email, role")
    .eq("email", DEMO_TEACHER_EMAIL)
    .maybeSingle();

  if (!teacher) {
    console.warn(
      `No ${DEMO_TEACHER_EMAIL}. Sign up as teacher, then re-run this script.`,
    );
    return;
  }

  if (teacher.role !== "teacher") {
    await supabase.from("user").update({ role: "teacher" }).eq("id", teacher.id);
  }

  const { data: existing } = await supabase
    .from("classes")
    .select("id, invite_code")
    .eq("invite_code", DEMO_INVITE_CODE)
    .maybeSingle();

  if (existing) {
    console.log(
      `Pilot class ready: invite ${DEMO_INVITE_CODE} (${existing.id})`,
    );
  } else {
    const classId = randomUUID();
    const { error: cErr } = await supabase.from("classes").insert({
      id: classId,
      teacher_id: teacher.id,
      name: "Demo Math 12",
      grade: 12,
      subject: "mathematics",
      invite_code: DEMO_INVITE_CODE,
    });
    if (cErr) {
      console.error("Class insert failed:", cErr.message);
      process.exit(1);
    }
    console.log(`Created Demo Math 12 with invite ${DEMO_INVITE_CODE}`);
  }

  console.log("Pilot reset complete (history preserved).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
