"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { facilitators, sessionReports } from "@/db/schema";
import { sessionReportFormSchema } from "@/lib/validation";

export type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function fieldErrorsFromZod(err: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const fe = err.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(fe)) {
    if (v && v.length) out[k] = v;
  }
  return out;
}

async function findOrCreateFacilitator(siteId: string, name: string) {
  const db = getDb();
  const trimmed = name.trim();
  const existing = await db
    .select()
    .from(facilitators)
    .where(
      and(
        eq(facilitators.siteId, siteId),
        sql`lower(${facilitators.name}) = ${trimmed.toLowerCase()}`,
      ),
    )
    .limit(1);

  if (existing[0]) return existing[0];

  const id = crypto.randomUUID();
  const row = {
    id,
    siteId,
    name: trimmed,
    createdAt: new Date(),
  };
  await db.insert(facilitators).values(row);
  return row;
}

export async function submitSessionReport(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    siteId: String(formData.get("siteId") ?? ""),
    facilitatorName: String(formData.get("facilitatorName") ?? ""),
    sessionDate: String(formData.get("sessionDate") ?? ""),
    youthRegistered: formData.get("youthRegistered"),
    youthPresent: formData.get("youthPresent"),
    sessionsDelivered: formData.get("sessionsDelivered"),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = sessionReportFormSchema.safeParse({
    ...raw,
    sessionsDelivered: raw.sessionsDelivered || 1,
    notes: raw.notes || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const data = parsed.data;
  const db = getDb();

  try {
    const facilitator = await findOrCreateFacilitator(
      data.siteId,
      data.facilitatorName,
    );

    await db.insert(sessionReports).values({
      id: crypto.randomUUID(),
      siteId: data.siteId,
      facilitatorId: facilitator.id,
      sessionDate: data.sessionDate,
      youthRegistered: data.youthRegistered,
      youthPresent: data.youthPresent,
      sessionsDelivered: data.sessionsDelivered,
      notes: data.notes?.trim() ? data.notes.trim() : null,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      message: "Could not save this report. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/");

  return { ok: true, message: "Report saved. Thank you." };
}
