"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { getDb } from "@/db";
import { participantEntries, sites } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { canOnSite } from "@/lib/permissions";
import {
  parseParticipantImportWorkbook,
  validateImportRow,
} from "@/lib/participant-excel";

const MAX_FILE_BYTES = 800_000;

export type ImportParticipantsResult =
  | { ok: true; imported: number; failed: { rowNumber: number; message: string }[] }
  | { ok: false; message: string };

export async function importParticipantsFromExcel(
  _prev: ImportParticipantsResult | undefined,
  formData: FormData,
): Promise<ImportParticipantsResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "Choose a spreadsheet file." };
  }
  if (file.size === 0 || file.size > MAX_FILE_BYTES) {
    return { ok: false, message: "File must be non-empty and under 800KB." };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const parsed = parseParticipantImportWorkbook(buf);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  const db = getDb();
  const allSites = await db.select({ id: sites.id, code: sites.code }).from(sites);
  const siteIdByCodeUpper = new Map(
    allSites.map((s) => [String(s.code).trim().toUpperCase(), s.id]),
  );

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const failed: { rowNumber: number; message: string }[] = [];
  let imported = 0;

  for (const row of parsed.rows) {
    const code = row.raw.site_code.trim().toUpperCase();
    if (!code) {
      failed.push({ rowNumber: row.rowNumber, message: "site_code is empty." });
      continue;
    }
    const siteId = siteIdByCodeUpper.get(code);
    if (!siteId) {
      failed.push({
        rowNumber: row.rowNumber,
        message: `Unknown site_code "${row.raw.site_code.trim()}".`,
      });
      continue;
    }
    const allowed = await canOnSite(userId, isSuperAdmin, siteId, "create");
    if (!allowed) {
      failed.push({
        rowNumber: row.rowNumber,
        message: `No permission to create registrations for site ${code}.`,
      });
      continue;
    }
    const v = validateImportRow(row, siteId);
    if (!v.ok) {
      failed.push({ rowNumber: row.rowNumber, message: v.message });
      continue;
    }
    const data = v.data;
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
      imported++;
    } catch (e) {
      console.error(e);
      failed.push({ rowNumber: row.rowNumber, message: "Could not save this row to the database." });
    }
  }

  revalidatePath("/entry");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/");

  return { ok: true, imported, failed };
}
