import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireAdmin } from "../lib/auth-user";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const createSchema = z.object({
  name: z.string().min(1).max(200),
  subCity: z.string().max(120).optional(),
  woreda: z.string().max(120).optional(),
  region: z.string().max(120).optional().default("Addis Ababa"),
  cohortTag: z.string().max(120).optional(),
  schoolType: z.enum(["government", "private", "other"]).optional().default("government"),
  verified: z.boolean().optional().default(false),
  teacherInviteCode: z.string().min(3).max(64).optional(),
});

function mapSchool(
  row: {
    id: string;
    name: string;
    sub_city: string | null;
    woreda: string | null;
    region: string;
    cohort_tag: string | null;
    school_type: string;
    verified: boolean;
    teacher_invite_code: string | null;
    created_at: string;
  },
  opts?: { includeInviteCode?: boolean },
) {
  return {
    id: row.id,
    name: row.name,
    subCity: row.sub_city,
    woreda: row.woreda,
    region: row.region,
    cohortTag: row.cohort_tag,
    schoolType: row.school_type,
    verified: row.verified,
    createdAt: row.created_at,
    ...(opts?.includeInviteCode
      ? { teacherInviteCode: row.teacher_invite_code }
      : {}),
  };
}

export const schoolsApp = new Hono<HonoEnv>();

schoolsApp.get("/", async (c) => {
  const db = createDb(c.env);
  const { data, error } = await db
    .from("schools")
    .select(
      "id, name, sub_city, woreda, region, cohort_tag, school_type, verified, teacher_invite_code, created_at",
    )
    .order("name", { ascending: true });

  if (error) return c.json({ error: error.message }, 500);

  return c.json({
    schools: (data ?? []).map((row) => mapSchool(row)),
  });
});

schoolsApp.get("/:id", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const { data, error } = await db
    .from("schools")
    .select(
      "id, name, sub_city, woreda, region, cohort_tag, school_type, verified, teacher_invite_code, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "School not found" }, 404);

  return c.json({ school: mapSchool(data) });
});

schoolsApp.post("/", zValidator("json", createSchema), async (c) => {
  const admin = await requireAdmin(c);
  if (!isAuthUser(admin)) return admin;

  const body = c.req.valid("json");
  const db = createDb(c.env);
  const id = randomUUID();

  const { data, error } = await db
    .from("schools")
    .insert({
      id,
      name: body.name,
      sub_city: body.subCity ?? null,
      woreda: body.woreda ?? null,
      region: body.region,
      cohort_tag: body.cohortTag ?? null,
      school_type: body.schoolType,
      verified: body.verified,
      teacher_invite_code: body.teacherInviteCode?.trim().toUpperCase() ?? null,
    })
    .select(
      "id, name, sub_city, woreda, region, cohort_tag, school_type, verified, teacher_invite_code, created_at",
    )
    .maybeSingle();

  if (error) {
    if (/unique/i.test(error.message)) {
      return c.json({ error: "Invite code already in use" }, 409);
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ school: data ? mapSchool(data, { includeInviteCode: true }) : { id, name: body.name } }, 201);
});
