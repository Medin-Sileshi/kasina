import { randomUUID } from "node:crypto";
import type { createDb } from "../db";
import type { ServerEnv } from "../env";
import { sendSms } from "./sms";

type Db = ReturnType<typeof createDb>;

export type CascadeRole = "school_admin" | "teacher" | "student";

/** Normalize phone for uniqueness; keep leading + if present. */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim().replace(/[\s-]/g, "");
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  return trimmed.replace(/\D/g, "");
}

export function inviteEmailForPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "") || "unknown";
  return `invite+${digits}@kasina.invite`;
}

export function activateUrl(env: ServerEnv, phone: string): string {
  const base = (env.APP_URL || "https://kasina.et").replace(/\/$/, "");
  return `${base}/activate?phone=${encodeURIComponent(phone)}`;
}

export async function writeRosterAudit(
  db: Db,
  opts: {
    actorUserId: string;
    actorRole: "school_admin" | "teacher" | "admin";
    schoolId: string;
    action: string;
    targetUserId?: string | null;
    classId?: string | null;
    meta?: Record<string, unknown>;
  },
) {
  const { error } = await db.from("roster_audit_log").insert({
    id: randomUUID(),
    actor_user_id: opts.actorUserId,
    actor_role: opts.actorRole,
    school_id: opts.schoolId,
    action: opts.action,
    target_user_id: opts.targetUserId ?? null,
    class_id: opts.classId ?? null,
    meta_json: opts.meta ?? null,
  });
  if (error) console.error("[roster-audit]", error.message);
}

/**
 * Create an invited cascade user (trusted, not yet OTP-activated).
 * Returns existing user id if phone already registered.
 */
export async function createInvitedUser(
  db: Db,
  env: ServerEnv,
  opts: {
    name: string;
    phone: string;
    role: CascadeRole;
    schoolId: string;
    email?: string | null;
  },
): Promise<{ userId: string; created: boolean; phone: string }> {
  const phone = normalizePhone(opts.phone);
  if (phone.length < 7) {
    throw new Error("Phone number is too short");
  }

  const { data: existing } = await db
    .from("user")
    .select("id, role, school_id, approval_status")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return { userId: existing.id, created: false, phone };
  }

  const userId = randomUUID();
  const email = (opts.email?.trim() || inviteEmailForPhone(phone)).toLowerCase();
  const now = new Date().toISOString();

  const { error } = await db.from("user").insert({
    id: userId,
    name: opts.name.trim(),
    email,
    emailVerified: false,
    role: opts.role,
    phone,
    phoneVerified: false,
    approval_status: "invited",
    school_id: opts.schoolId,
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    // Race on unique phone/email
    const { data: again } = await db
      .from("user")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (again) return { userId: again.id, created: false, phone };
    throw new Error(error.message);
  }

  const link = activateUrl(env, phone);
  const roleLabel =
    opts.role === "school_admin"
      ? "school admin"
      : opts.role === "teacher"
        ? "teacher"
        : "student";
  await sendSms(env, {
    to: phone,
    message: `Kasina: you were added as a ${roleLabel}. Activate with your phone: ${link}`,
  });

  return { userId, created: true, phone };
}

export function randomInviteCode(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]!;
  }
  return `${prefix}${suffix}`;
}
