import { z } from "zod";

export const sessionReportFormSchema = z
  .object({
    siteId: z.string().min(1, "Select a site"),
    facilitatorName: z
      .string()
      .min(2, "Enter your name (at least 2 characters)")
      .max(120),
    sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"),
    youthRegistered: z.coerce.number().int().min(0),
    youthPresent: z.coerce.number().int().min(0),
    sessionsDelivered: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? 1 : v),
      z.coerce.number().int().min(1).max(100),
    ),
    notes: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.youthPresent > data.youthRegistered) {
      ctx.addIssue({
        code: "custom",
        path: ["youthPresent"],
        message: "Present cannot exceed registered",
      });
    }
  });

export type SessionReportFormInput = z.infer<typeof sessionReportFormSchema>;
