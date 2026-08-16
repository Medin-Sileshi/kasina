import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MIN_ATTEMPTS,
  WEAK_THRESHOLD,
  weakTopicsForClass,
} from "./weak-topics-db";

export type ClassRow = {
  id: string;
  name: string;
  grade: number;
  subject: string;
  invite_code: string;
  created_at?: string;
  teacher_id?: string;
};

export type ClassOverviewEntry = {
  id: string;
  name: string;
  grade: number;
  subject: string;
  inviteCode: string;
  roster: Array<{
    studentId: string;
    name: string;
    email: string;
    joinedAt: string;
    lastActivityAt: string | null;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    dueAt: string | null;
    questionCount: number;
    createdAt: string;
  }>;
  students: Array<{
    studentId: string;
    name: string;
    email: string;
    sessionsCount: number;
    lastScore: number | null;
    lastTotal: number | null;
    lastPercent: number | null;
    assignmentStatus: Record<
      string,
      { status: "todo" | "done"; score: number | null; total: number | null }
    >;
  }>;
  weakTopics: Array<{
    topic: string;
    unit: string;
    accuracy: number;
    attempts: number;
  }>;
  thresholds: {
    minAttempts: number;
    accuracyPercent: number;
  };
};

type SessionRow = {
  id: string;
  user_id: string;
  score: number | null;
  total: number | null;
  completed_at: string | null;
  assignment_id: string | null;
  started_at: string;
};

export async function buildClassOverviewEntry(
  db: SupabaseClient,
  klass: ClassRow,
): Promise<ClassOverviewEntry> {
  const [membersRes, assignmentsRes] = await Promise.all([
    db
      .from("class_members")
      .select("student_id, joined_at")
      .eq("class_id", klass.id)
      .order("joined_at", { ascending: true }),
    db
      .from("assignments")
      .select("id, title, due_at, created_at, question_count")
      .eq("class_id", klass.id)
      .order("created_at", { ascending: false }),
  ]);

  if (membersRes.error) throw new Error(membersRes.error.message);
  if (assignmentsRes.error) throw new Error(assignmentsRes.error.message);

  const members = membersRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const studentIds = members.map((m) => m.student_id);

  const [usersRes, sessionsRes] = await Promise.all([
    studentIds.length
      ? db.from("user").select("id, name, email").in("id", studentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; email: string }>, error: null }),
    studentIds.length
      ? db
          .from("practice_sessions")
          .select(
            "id, user_id, score, total, completed_at, assignment_id, started_at",
          )
          .in("user_id", studentIds)
      : Promise.resolve({ data: [] as SessionRow[], error: null }),
  ]);

  if (usersRes.error) throw new Error(usersRes.error.message);
  if (sessionsRes.error) throw new Error(sessionsRes.error.message);

  const usersById = new Map<string, { name: string; email: string }>();
  for (const u of usersRes.data ?? []) {
    usersById.set(u.id, { name: u.name, email: u.email });
  }

  const sessionRows = (sessionsRes.data ?? []) as SessionRow[];
  const completed = sessionRows.filter((s) => s.completed_at);
  const completedSessionIds = completed.map((s) => s.id);

  const lastActivity = new Map<string, string>();
  for (const s of sessionRows) {
    const at = s.completed_at ?? s.started_at;
    const prev = lastActivity.get(s.user_id);
    if (!prev || at > prev) lastActivity.set(s.user_id, at);
  }

  const students = studentIds.map((studentId) => {
    const theirs = completed
      .filter((s) => s.user_id === studentId)
      .sort((a, b) =>
        (b.completed_at ?? "").localeCompare(a.completed_at ?? ""),
      );
    const last = theirs[0];
    const assignmentStatus: Record<
      string,
      { status: "todo" | "done"; score: number | null; total: number | null }
    > = {};
    for (const a of assignments) {
      const forAssign = theirs.filter((s) => s.assignment_id === a.id);
      const latest = forAssign[0];
      assignmentStatus[a.id] = latest
        ? {
            status: "done",
            score: latest.score,
            total: latest.total,
          }
        : { status: "todo", score: null, total: null };
    }
    return {
      studentId,
      name: usersById.get(studentId)?.name ?? "Student",
      email: usersById.get(studentId)?.email ?? "",
      sessionsCount: theirs.length,
      lastScore: last?.score ?? null,
      lastTotal: last?.total ?? null,
      lastPercent:
        last?.total && last.total > 0
          ? Math.round(((last.score ?? 0) / last.total) * 100)
          : null,
      assignmentStatus,
    };
  });

  const weak = await weakTopicsForClass(db, studentIds, completedSessionIds);
  const weakTopics = weak.map((t) => ({
    topic: t.topic,
    unit: t.unit,
    accuracy: t.accuracy,
    attempts: t.attempts,
  }));

  return {
    id: klass.id,
    name: klass.name,
    grade: klass.grade,
    subject: klass.subject,
    inviteCode: klass.invite_code,
    roster: members.map((m) => {
      const u = usersById.get(m.student_id);
      return {
        studentId: m.student_id,
        name: u?.name ?? "Student",
        email: u?.email ?? "",
        joinedAt: m.joined_at,
        lastActivityAt: lastActivity.get(m.student_id) ?? null,
      };
    }),
    assignments: assignments.map((a) => ({
      id: a.id,
      title: a.title,
      dueAt: a.due_at,
      questionCount: a.question_count,
      createdAt: a.created_at,
    })),
    students,
    weakTopics,
    thresholds: {
      minAttempts: MIN_ATTEMPTS,
      accuracyPercent: Math.round(WEAK_THRESHOLD * 100),
    },
  };
}
