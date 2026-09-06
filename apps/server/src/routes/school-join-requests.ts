import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { clientKey, rateLimit } from "../lib/rate-limit";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const createSchema = z.object({
  schoolName: z.string().min(2).max(200),
  subCity: z.string().max(120).optional(),
  woreda: z.string().max(120).optional(),
  region: z.string().max(120).optional().default("Addis Ababa"),
  declaredSchoolType: z
    .enum(["government", "private", "other"])
    .default("government"),
  contactName: z.string().min(1).max(120),
  contactPhone: z.string().min(7).max(32),
  contactEmail: z.string().email().optional().or(z.literal("")),
  estimatedTeachers: z.number().int().min(0).max(5000).optional(),
  estimatedStudents: z.number().int().min(0).max(50000).optional(),
});

export const schoolJoinRequestsApp = new Hono<HonoEnv>();

schoolJoinRequestsApp.post(
  "/",
  zValidator("json", createSchema),
  async (c) => {
    const rl = rateLimit({
      key: `school-join:${clientKey(c)}`,
      limit: 8,
      windowMs: 60 * 60_000,
    });
    if (!rl.ok) {
      return c.json(
        {
          error: `Too many requests. Try again in ${rl.retryAfterSec}s.`,
        },
        429,
      );
    }

    const body = c.req.valid("json");
    const db = createDb(c.env);
    const id = randomUUID();

    const { error } = await db.from("school_join_requests").insert({
      id,
      school_name: body.schoolName.trim(),
      sub_city: body.subCity?.trim() || null,
      woreda: body.woreda?.trim() || null,
      region: body.region?.trim() || "Addis Ababa",
      declared_school_type: body.declaredSchoolType,
      contact_name: body.contactName.trim(),
      contact_phone: body.contactPhone.trim(),
      contact_email: body.contactEmail?.trim() || null,
      estimated_teachers: body.estimatedTeachers ?? null,
      estimated_students: body.estimatedStudents ?? null,
      status: "pending",
    });

    if (error) return c.json({ error: error.message }, 500);

    return c.json({
      id,
      status: "pending" as const,
      message:
        "Request received. A Kasina admin will review it and contact you.",
    });
  },
);
