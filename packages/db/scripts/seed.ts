import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { validateQuestions } from "@kasina/question-bank";
import {
  DEMO_INVITE_CODE,
  DEMO_TEACHER_EMAIL,
} from "../src/index";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_CLASS_NAME = "Ministry Demo School — Grade 12 Math";

const DEMO_STUDENTS: Array<{ name: string; email: string }> = [
  { name: "Abel Tadesse", email: "abel.tadesse@demo.kasina.et" },
  { name: "Bethel Haile", email: "bethel.haile@demo.kasina.et" },
  { name: "Dawit Mekonnen", email: "dawit.mekonnen@demo.kasina.et" },
  { name: "Eden Solomon", email: "eden.solomon@demo.kasina.et" },
  { name: "Feven Girma", email: "feven.girma@demo.kasina.et" },
  { name: "Getachew Bekele", email: "getachew.bekele@demo.kasina.et" },
  { name: "Hanna Yohannes", email: "hanna.yohannes@demo.kasina.et" },
  { name: "Israel Alemu", email: "israel.alemu@demo.kasina.et" },
  { name: "Kidist Negash", email: "kidist.negash@demo.kasina.et" },
  { name: "Lidya Desta", email: "lidya.desta@demo.kasina.et" },
  { name: "Meron Assefa", email: "meron.assefa@demo.kasina.et" },
  { name: "Nahom Tekle", email: "nahom.tekle@demo.kasina.et" },
  { name: "Rahel Worku", email: "rahel.worku@demo.kasina.et" },
  { name: "Samuel Fikadu", email: "samuel.fikadu@demo.kasina.et" },
  { name: "Tigist Alemayehu", email: "tigist.alemayehu@demo.kasina.et" },
  { name: "Yonatan Kebede", email: "yonatan.kebede@demo.kasina.et" },
  { name: "Zewditu Lemma", email: "zewditu.lemma@demo.kasina.et" },
  { name: "Abigail Tesfaye", email: "abigail.tesfaye@demo.kasina.et" },
  { name: "Biniam Girma", email: "biniam.girma@demo.kasina.et" },
  { name: "Chaltu Hailu", email: "chaltu.hailu@demo.kasina.et" },
  { name: "Daniel Abebaw", email: "daniel.abebaw@demo.kasina.et" },
  { name: "Eyerusalem Tadesse", email: "eyerusalem.tadesse@demo.kasina.et" },
  { name: "Fikirte Demissie", email: "fikirte.demissie@demo.kasina.et" },
  { name: "Girmay Wolde", email: "girmay.wolde@demo.kasina.et" },
  { name: "Helen Asfaw", email: "helen.asfaw@demo.kasina.et" },
  { name: "Iyasu Mulugeta", email: "iyasu.mulugeta@demo.kasina.et" },
  { name: "Kalkidan Belete", email: "kalkidan.belete@demo.kasina.et" },
  { name: "Liya Gebre", email: "liya.gebre@demo.kasina.et" },
  { name: "Mekdes Teshome", email: "mekdes.teshome@demo.kasina.et" },
  { name: "Natnael Berhanu", email: "natnael.berhanu@demo.kasina.et" },
  { name: "Oliyad Lemma", email: "oliyad.lemma@demo.kasina.et" },
  { name: "Ruth Assefa", email: "ruth.assefa@demo.kasina.et" },
  { name: "Sara Mamo", email: "sara.mamo@demo.kasina.et" },
  { name: "Tariku Hailemariam", email: "tariku.hailemariam@demo.kasina.et" },
  { name: "Tsion Getachew", email: "tsion.getachew@demo.kasina.et" },
  { name: "Wondimu Alemu", email: "wondimu.alemu@demo.kasina.et" },
  { name: "Yared Negussie", email: "yared.negussie@demo.kasina.et" },
  { name: "Zemenu Tesfa", email: "zemenu.tesfa@demo.kasina.et" },
  { name: "Abeba Hailu", email: "abeba.hailu@demo.kasina.et" },
  { name: "Bereket Fisseha", email: "bereket.fisseha@demo.kasina.et" },
];

/** Deterministic pseudo-random in [0, 1) from a string seed. */
function seededRand(seed: string, salt: number) {
  let h = salt;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (h % 1000) / 1000;
}

function shuffleIds(ids: string[], seed: string): string[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seededRand(seed, i) * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

async function main() {
  const seedPath = resolve(
    import.meta.dirname,
    "../../question-bank/data/grade12-math-seed.json",
  );
  const questions = validateQuestions(
    JSON.parse(readFileSync(seedPath, "utf8")),
  );

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

  const questionIds = questions
    .filter((q) => !(q.tags ?? []).some((t) => t.toLowerCase() === "sample"))
    .map((q) => q.id);
  const questionById = new Map(questions.map((q) => [q.id, q]));

  const { data: teacher, error: tErr } = await supabase
    .from("user")
    .select("id, email, role")
    .eq("email", DEMO_TEACHER_EMAIL)
    .maybeSingle();

  if (tErr) {
    console.error("Teacher lookup failed:", tErr.message);
    process.exit(1);
  }

  if (!teacher) {
    console.warn(
      `No user ${DEMO_TEACHER_EMAIL} yet. Sign up as teacher in the app, then re-run seed to attach class ${DEMO_INVITE_CODE}.`,
    );
    return;
  }

  if (teacher.role !== "teacher") {
    await supabase.from("user").update({ role: "teacher" }).eq("id", teacher.id);
  }

  let classId: string;
  const { data: existingClass } = await supabase
    .from("classes")
    .select("id, name")
    .eq("invite_code", DEMO_INVITE_CODE)
    .maybeSingle();

  if (existingClass) {
    classId = existingClass.id;
    if (existingClass.name !== DEMO_CLASS_NAME) {
      await supabase
        .from("classes")
        .update({ name: DEMO_CLASS_NAME })
        .eq("id", classId);
    }
    console.log(`Demo class exists (${classId}) — ${DEMO_INVITE_CODE}`);
  } else {
    classId = randomUUID();
    const { error: cErr } = await supabase.from("classes").insert({
      id: classId,
      teacher_id: teacher.id,
      name: DEMO_CLASS_NAME,
      grade: 12,
      subject: "mathematics",
      invite_code: DEMO_INVITE_CODE,
    });
    if (cErr) {
      console.error("Class insert failed:", cErr.message);
      process.exit(1);
    }
    console.log(`Created class "${DEMO_CLASS_NAME}" invite ${DEMO_INVITE_CODE}`);
  }

  // Demo students + roster
  const studentIds: string[] = [];
  for (const s of DEMO_STUDENTS) {
    const { data: existingUser } = await supabase
      .from("user")
      .select("id")
      .eq("email", s.email)
      .maybeSingle();

    let studentId = existingUser?.id;
    if (!studentId) {
      studentId = randomUUID();
      const { error: uErr } = await supabase.from("user").insert({
        id: studentId,
        name: s.name,
        email: s.email,
        role: "student",
        emailVerified: false,
      });
      if (uErr) {
        console.error(`User insert failed for ${s.email}:`, uErr.message);
        continue;
      }
    }
    studentIds.push(studentId);

    await supabase.from("class_members").upsert(
      {
        class_id: classId,
        student_id: studentId,
        joined_at: new Date(
          Date.now() - Math.floor(seededRand(s.email, 1) * 30) * 86400000,
        ).toISOString(),
      },
      { onConflict: "class_id,student_id" },
    );
  }
  console.log(`Roster: ${studentIds.length} demo students`);

  // Skip re-seeding sessions if demo sessions already exist for this class roster
  const { count: existingSessions } = await supabase
    .from("practice_sessions")
    .select("id", { count: "exact", head: true })
    .in("user_id", studentIds.slice(0, 5));

  if ((existingSessions ?? 0) >= 5) {
    console.log("Demo practice sessions already seeded — skipping session generation");
    return;
  }

  // Mixed practice history per student
  for (const studentId of studentIds) {
    const student = DEMO_STUDENTS.find((_, i) => studentIds[i] === studentId);
    const email = student?.email ?? studentId;
    const sessionCount = 1 + Math.floor(seededRand(email, 2) * 3);

    for (let s = 0; s < sessionCount; s += 1) {
      const qCount = 8 + Math.floor(seededRand(email, 10 + s) * 8);
      const picked = shuffleIds(questionIds, `${email}-${s}`).slice(0, qCount);
      const accuracy = 0.35 + seededRand(email, 20 + s) * 0.55;
      const targetScore = Math.round(picked.length * accuracy);

      const sessionId = randomUUID();
      const startedAt = new Date(
        Date.now() -
          (3 + Math.floor(seededRand(email, 30 + s) * 14)) * 86400000,
      ).toISOString();

      const { error: sessErr } = await supabase.from("practice_sessions").insert({
        id: sessionId,
        user_id: studentId,
        subject: "mathematics",
        grade: 12,
        mode: s === 0 && seededRand(email, 40) > 0.7 ? "cbt" : "random",
        topic: s === 0 ? "Calculus" : "Mixed practice",
        unit: s === 0 ? "Calculus" : null,
        question_ids: picked,
        total: picked.length,
        score: targetScore,
        completed_at: startedAt,
        started_at: startedAt,
      });
      if (sessErr) {
        console.warn(`Session insert skipped for ${email}:`, sessErr.message);
        continue;
      }

      const answerRows = picked.map((qid, idx) => {
        const q = questionById.get(qid)!;
        const shouldCorrect = idx < targetScore;
        const wrongOption = q.options as Array<{ id: string }>;
        const alt = wrongOption.find((o) => o.id !== q.correctOptionId)?.id ?? "a";
        return {
          id: randomUUID(),
          session_id: sessionId,
          question_id: qid,
          selected_option_id: shouldCorrect ? q.correctOptionId : alt,
          is_correct: shouldCorrect,
          time_taken_seconds: 30 + Math.floor(seededRand(email, 50 + idx) * 90),
          answered_at: startedAt,
        };
      });

      await supabase.from("answers").insert(answerRows);
    }
  }
  console.log("Seeded demo practice sessions with mixed scores");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
