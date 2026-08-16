import { z } from "zod";

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  text: z.string().min(1),
});

export const questionSchema = z
  .object({
    id: z.string().min(1),
    grade: z.number().int().positive(),
    subject: z.enum([
      "mathematics",
      "physics",
      "chemistry",
      "biology",
      "english",
      "history",
      "geography",
      "economics",
      "civics",
    ]),
    stream: z.enum(["natural", "social", "both"]).optional(),
    year: z.number().int().optional(),
    unit: z.string().min(1),
    topic: z.string().min(1),
    stem: z.string().min(1),
    stemAm: z.string().optional(),
    options: z.array(questionOptionSchema).length(4),
    correctOptionId: z.string().min(1),
    explanation: z.string().min(1),
    explanationAm: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    tags: z.array(z.string()).optional(),
  })
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    if (!ids.includes(q.correctOptionId)) {
      ctx.addIssue({
        code: "custom",
        message: `correctOptionId "${q.correctOptionId}" not in options`,
        path: ["correctOptionId"],
      });
    }
  });

export const questionBankSchema = z.array(questionSchema).min(1);

export type QuestionInput = z.infer<typeof questionSchema>;
