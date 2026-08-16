import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export function generateInviteCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

export async function assertClassOwner(
  db: SupabaseClient,
  classId: string,
  teacherId: string,
) {
  const { data, error } = await db
    .from("classes")
    .select("id, teacher_id, name, grade, subject, invite_code, created_at")
    .eq("id", classId)
    .maybeSingle();
  if (error) return { error: error.message, klass: null };
  if (!data) return { error: "Class not found", klass: null };
  if (data.teacher_id !== teacherId) {
    return { error: "Forbidden", klass: null };
  }
  return { error: null, klass: data };
}

export async function getClassAccess(
  db: SupabaseClient,
  classId: string,
  userId: string,
  role: string,
) {
  const { data: klass, error } = await db
    .from("classes")
    .select("id, teacher_id, name, grade, subject, invite_code, created_at")
    .eq("id", classId)
    .maybeSingle();
  if (error) return { error: error.message, klass: null, as: null as null };
  if (!klass) return { error: "Class not found", klass: null, as: null as null };

  if (klass.teacher_id === userId || role === "admin") {
    return { error: null, klass, as: "teacher" as const };
  }

  const { data: member } = await db
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId)
    .eq("student_id", userId)
    .maybeSingle();

  if (member) return { error: null, klass, as: "student" as const };
  return { error: "Forbidden", klass: null, as: null as null };
}
