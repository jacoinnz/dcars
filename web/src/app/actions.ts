"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { participantEntries } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canOnSite } from "@/lib/permissions";
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
    fatherName: String(formData.get("fatherName") ?? ""),
    fatherOccupation: String(formData.get("fatherOccupation") ?? ""),
    fatherPhone: String(formData.get("fatherPhone") ?? ""),
    fatherEmail: String(formData.get("fatherEmail") ?? ""),
    motherName: String(formData.get("motherName") ?? ""),
    motherOccupation: String(formData.get("motherOccupation") ?? ""),
    motherPhone: String(formData.get("motherPhone") ?? ""),
    motherEmail: String(formData.get("motherEmail") ?? ""),
    guardianName: String(formData.get("guardianName") ?? ""),
    guardianRelationship: String(formData.get("guardianRelationship") ?? ""),
    guardianPhone: String(formData.get("guardianPhone") ?? ""),
    guardianEmail: String(formData.get("guardianEmail") ?? ""),
    documentBirthCert: String(formData.get("documentBirthCert") ?? ""),
    documentNationalId: String(formData.get("documentNationalId") ?? ""),
    documentTransferCert: String(formData.get("documentTransferCert") ?? ""),
    documentMedicalImmunization: String(formData.get("documentMedicalImmunization") ?? ""),
    documentOtherNotes: String(formData.get("documentOtherNotes") ?? ""),
    previousSchool: String(formData.get("previousSchool") ?? ""),
    previousSchoolAddress: String(formData.get("previousSchoolAddress") ?? ""),
    previousSchoolClassOrGrade: String(formData.get("previousSchoolClassOrGrade") ?? ""),
    previousSchoolDateLeft: String(formData.get("previousSchoolDateLeft") ?? ""),
    previousSchoolLeavingReason: String(formData.get("previousSchoolLeavingReason") ?? ""),
    admissionNotes: String(formData.get("admissionNotes") ?? ""),
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
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in to save an entry." };
  }
  const allowed = await canOnSite(
    session.user.id,
    Boolean(session.user.isSuperAdmin),
    data.siteId,
    "create",
  );
  if (!allowed) {
    return {
      ok: false,
      message: "You do not have permission to register participants for this site.",
    };
  }

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
      fatherName: data.fatherName ?? null,
      fatherOccupation: data.fatherOccupation ?? null,
      fatherPhone: data.fatherPhone ?? null,
      fatherEmail: data.fatherEmail ?? null,
      motherName: data.motherName ?? null,
      motherOccupation: data.motherOccupation ?? null,
      motherPhone: data.motherPhone ?? null,
      motherEmail: data.motherEmail ?? null,
      guardianName: data.guardianName ?? null,
      guardianRelationship: data.guardianRelationship ?? null,
      guardianPhone: data.guardianPhone ?? null,
      guardianEmail: data.guardianEmail ?? null,
      documentBirthCert: data.documentBirthCert ?? null,
      documentNationalId: data.documentNationalId ?? null,
      documentTransferCert: data.documentTransferCert ?? null,
      documentMedicalImmunization: data.documentMedicalImmunization ?? null,
      documentOtherNotes: data.documentOtherNotes ?? null,
      previousSchool: data.previousSchool ?? null,
      previousSchoolAddress: data.previousSchoolAddress ?? null,
      previousSchoolClassOrGrade: data.previousSchoolClassOrGrade ?? null,
      previousSchoolDateLeft: data.previousSchoolDateLeft ?? null,
      previousSchoolLeavingReason: data.previousSchoolLeavingReason ?? null,
      admissionNotes: data.admissionNotes ?? null,
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
