import type { Context } from "hono";
import { createAuth, type Auth, withPgRetry } from "../auth";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin" | "school_admin";
  approvalStatus?: string;
  phone?: string;
  schoolId?: string | null;
};

type SessionResult = Awaited<ReturnType<Auth["api"]["getSession"]>>;

const SESSION_TTL_MS = 2_500;
const sessionCache = new Map<
  string,
  { expiresAt: number; value: SessionResult }
>();
const sessionInflight = new Map<string, Promise<SessionResult>>();

function sessionCacheKey(headers: Headers): string {
  return headers.get("cookie") ?? "";
}

/**
 * Coalesce parallel getSession calls (layout + page queries) so we don't
 * stampede the tiny Supabase pg pool and trip connection timeouts.
 */
export async function getSessionCached(
  auth: Auth,
  headers: Headers,
): Promise<SessionResult> {
  const key = sessionCacheKey(headers);
  const now = Date.now();
  const hit = sessionCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }

  const pending = sessionInflight.get(key);
  if (pending) return pending;

  const request = withPgRetry(() => auth.api.getSession({ headers }))
    .then((value) => {
      sessionCache.set(key, {
        expiresAt: Date.now() + SESSION_TTL_MS,
        value,
      });
      return value;
    })
    .finally(() => {
      sessionInflight.delete(key);
    });

  sessionInflight.set(key, request);
  return request;
}

export async function requireUser(
  c: Context<HonoEnv>,
): Promise<AuthUser | Response> {
  const auth = createAuth(c.env);
  let session: SessionResult;
  try {
    session = await getSessionCached(auth, c.req.raw.headers);
  } catch (err) {
    console.error(
      "[auth] getSession failed:",
      err instanceof Error ? err.message : err,
    );
    return c.json({ error: "Auth temporarily unavailable" }, 503);
  }
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const user = session.user as {
    id: string;
    email: string;
    name: string;
    role?: string;
    approvalStatus?: string;
    phone?: string;
    phoneNumber?: string;
    schoolId?: string | null;
  };

  let approvalStatus = user.approvalStatus;
  let phone = user.phone ?? user.phoneNumber;
  let schoolId = user.schoolId ?? null;

  if (approvalStatus === undefined || phone === undefined) {
    const db = createDb(c.env);
    const { data: row } = await db
      .from("user")
      .select("approval_status, phone, school_id")
      .eq("id", user.id)
      .maybeSingle();
    if (row) {
      approvalStatus = approvalStatus ?? row.approval_status ?? undefined;
      phone = phone ?? row.phone ?? undefined;
      schoolId = schoolId ?? row.school_id ?? null;
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: (user.role ?? "student") as AuthUser["role"],
    approvalStatus,
    phone,
    schoolId,
  };
}

export async function requireTeacher(
  c: Context<HonoEnv>,
): Promise<AuthUser | Response> {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  if (user.role !== "teacher" && user.role !== "admin") {
    return c.json({ error: "Teacher access required" }, 403);
  }
  return user;
}

export async function requireAdmin(
  c: Context<HonoEnv>,
): Promise<AuthUser | Response> {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  if (user.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }
  return user;
}

export async function requireSchoolAdmin(
  c: Context<HonoEnv>,
): Promise<AuthUser | Response> {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  if (user.role !== "school_admin") {
    return c.json({ error: "School admin access required" }, 403);
  }
  if (user.approvalStatus === "invited") {
    return c.json(
      { error: "Activate your account with phone OTP first", code: "invited" },
      403,
    );
  }
  if (user.approvalStatus && user.approvalStatus !== "approved") {
    return c.json({ error: "Account not approved" }, 403);
  }
  if (!user.schoolId) {
    return c.json({ error: "School admin missing school_id" }, 400);
  }
  return user;
}

export function isAuthUser(value: AuthUser | Response): value is AuthUser {
  return !(value instanceof Response) && "id" in value;
}
