"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { participantEntries } from "@/db/schema";
import { participantEntryFormSchema } from "@/lib/validation";

export type ActionState =
  | { ok: true; message: string; entryId?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function fieldErrorsFromZod(err: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  const fe = err.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(fe)) {
    if (v && v.length) out[k] = v;
  }
  return out;
}

export async function submitParticipantEntry(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    siteId: String(formData.get("siteId") ?? ""),
    dateOfEntry: String(formData.get("dateOfEntry") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    middleName: String(formData.get("middleName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    institutionName: String(formData.get("institutionName") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    ethnicGroup: String(formData.get("ethnicGroup") ?? ""),
    town: String(formData.get("town") ?? ""),
    pointOfContact: String(formData.get("pointOfContact") ?? ""),
    emergencyContact: String(formData.get("emergencyContact") ?? ""),
    emergencyContactNumber: String(formData.get("emergencyContactNumber") ?? ""),
    studentContactNumber: String(formData.get("studentContactNumber") ?? ""),
    nextOfKin: String(formData.get("nextOfKin") ?? ""),
  };

  const parsed = participantEntryFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const data = parsed.data;
  const db = getDb();
  const id = crypto.randomUUID();

  try {
    await db.insert(participantEntries).values({
      id,
      siteId: data.siteId,
      dateOfEntry: data.dateOfEntry,
      firstName: data.firstName.trim(),
      middleName: data.middleName ?? null,
      lastName: data.lastName.trim(),
      institutionName: data.institutionName.trim(),
      dateOfBirth: data.dateOfBirth,
      ethnicGroup: data.ethnicGroup.trim(),
      town: data.town.trim(),
      pointOfContact: data.pointOfContact.trim(),
      emergencyContact: data.emergencyContact.trim(),
      emergencyContactNumber: data.emergencyContactNumber.trim(),
      studentContactNumber: data.studentContactNumber.trim(),
      nextOfKin: data.nextOfKin.trim(),
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      message: "Could not save this entry. Please try again.",
    };
  }

  revalidatePath("/entry");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/");

  return {
    ok: true,
    entryId: id,
    message: `Entry saved. Your unique reference ID is ${id}.`,
  };
}
