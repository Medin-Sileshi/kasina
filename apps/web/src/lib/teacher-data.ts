"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";

export type ClassItem = {
  id: string;
  name: string;
  inviteCode: string;
  grade: number;
  subject: string;
};

export type ClassResults = {
  class: { id: string; name: string; inviteCode: string };
  assignments: Array<{
    id: string;
    title: string;
    dueAt?: string | null;
    questionCount?: number;
    createdAt?: string;
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
};

export type OverviewClass = {
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
  students: ClassResults["students"];
  weakTopics: ClassResults["weakTopics"];
};

export type TeacherOverview = {
  classes: OverviewClass[];
};

export type ClassInsight = {
  classItem: ClassItem;
  detail: {
    class: ClassItem;
    roster: OverviewClass["roster"];
  };
  results: ClassResults | null;
};

export type StudentRow = {
  studentId: string;
  name: string;
  email: string;
  classId: string;
  className: string;
  joinedAt: string;
  lastActivityAt: string | null;
  sessionsCount: number;
  lastPercent: number | null;
  lastScore: number | null;
  lastTotal: number | null;
};

export const teacherOverviewKey = ["teacher-overview"] as const;

export async function fetchTeacherOverview(): Promise<TeacherOverview> {
  return apiFetch<TeacherOverview>("/classes/overview");
}

export function useTeacherOverview() {
  return useQuery({
    queryKey: teacherOverviewKey,
    queryFn: fetchTeacherOverview,
    staleTime: 60_000,
  });
}

export function useTeacherClasses() {
  const overview = useTeacherOverview();
  const classes: ClassItem[] =
    overview.data?.classes.map((c) => ({
      id: c.id,
      name: c.name,
      inviteCode: c.inviteCode,
      grade: c.grade,
      subject: c.subject,
    })) ?? [];
  return {
    ...overview,
    data: overview.data ? classes : undefined,
  };
}

export function useTeacherClassInsights() {
  const overview = useTeacherOverview();
  const insights: ClassInsight[] =
    overview.data?.classes.map((c) => ({
      classItem: {
        id: c.id,
        name: c.name,
        inviteCode: c.inviteCode,
        grade: c.grade,
        subject: c.subject,
      },
      detail: {
        class: {
          id: c.id,
          name: c.name,
          inviteCode: c.inviteCode,
          grade: c.grade,
          subject: c.subject,
        },
        roster: c.roster,
      },
      results: {
        class: {
          id: c.id,
          name: c.name,
          inviteCode: c.inviteCode,
        },
        assignments: c.assignments,
        students: c.students,
        weakTopics: c.weakTopics,
      },
    })) ?? [];

  return {
    ...overview,
    data: overview.data ? insights : undefined,
  };
}

export function useInvalidateTeacherOverview() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: teacherOverviewKey });
}

export function flattenStudents(insights: ClassInsight[]): StudentRow[] {
  const rows: StudentRow[] = [];
  for (const insight of insights) {
    const byId = new Map(
      (insight.results?.students ?? []).map((s) => [s.studentId, s]),
    );
    for (const member of insight.detail.roster) {
      const stats = byId.get(member.studentId);
      rows.push({
        studentId: member.studentId,
        name: member.name,
        email: member.email,
        classId: insight.classItem.id,
        className: insight.classItem.name,
        joinedAt: member.joinedAt,
        lastActivityAt: member.lastActivityAt,
        sessionsCount: stats?.sessionsCount ?? 0,
        lastPercent: stats?.lastPercent ?? null,
        lastScore: stats?.lastScore ?? null,
        lastTotal: stats?.lastTotal ?? null,
      });
    }
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export function scoreTone(pct: number | null) {
  if (pct == null) return "text-gray-400";
  if (pct >= 80) return "text-primary-700";
  if (pct >= 60) return "text-warning-text";
  return "text-error-text";
}

export function readinessFromPercent(pct: number | null): {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
  estimate: number | null;
} {
  if (pct == null) {
    return { label: "Not enough data", tone: "neutral", estimate: null };
  }
  const estimate = Math.min(98, Math.max(12, Math.round(pct * 0.92 + 4)));
  if (estimate >= 75) {
    return { label: "On track", tone: "success", estimate };
  }
  if (estimate >= 55) {
    return { label: "Needs review", tone: "warning", estimate };
  }
  return { label: "At risk", tone: "danger", estimate };
}
