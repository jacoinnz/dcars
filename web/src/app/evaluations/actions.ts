"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { classes, performanceRecords, studentClasses, students } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution } from "@/lib/school-access";
import { studentAdmissionFormSchema } from "@/lib/validation";

export type StudentAdmissionState =
  | { ok: true; message: string; studentId: string }
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

async function sessionUser() {
  const s = await getServerSessionWithBypass();
  if (!s?.user?.id) throw new Error("You must be signed in.");
  return { userId: s.user.id, isSuperAdmin: Boolean(s.user.isSuperAdmin) };
}

export async function submitStudentAdmission(
  _prev: StudentAdmissionState | undefined,
  formData: FormData,
): Promise<StudentAdmissionState> {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in to admit a student." };
  }
  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const raw = {
    institutionId: String(formData.get("institutionId") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    middleName: String(formData.get("middleName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    academicYear: String(formData.get("academicYear") ?? ""),
    admissionClassLabel: String(formData.get("admissionClassLabel") ?? ""),
    admissionSectionLabel: String(formData.get("admissionSectionLabel") ?? ""),
    rollNumber: String(formData.get("rollNumber") ?? ""),
    studentGroup: String(formData.get("studentGroup") ?? ""),
    religion: String(formData.get("religion") ?? ""),
    caste: String(formData.get("caste") ?? ""),
    currentAddress: String(formData.get("currentAddress") ?? ""),
    permanentAddress: String(formData.get("permanentAddress") ?? ""),
    medicalCategory: String(formData.get("medicalCategory") ?? ""),
    heightIn: String(formData.get("heightIn") ?? ""),
    weightKg: String(formData.get("weightKg") ?? ""),
    photoUrl: String(formData.get("photoUrl") ?? ""),
    admissionNumber: String(formData.get("admissionNumber") ?? ""),
    admissionDate: String(formData.get("admissionDate") ?? ""),
    bloodGroup: String(formData.get("bloodGroup") ?? ""),
    previousSchool: String(formData.get("previousSchool") ?? ""),
    previousSchoolAddress: String(formData.get("previousSchoolAddress") ?? ""),
    previousSchoolClassOrGrade: String(formData.get("previousSchoolClassOrGrade") ?? ""),
    previousSchoolDateLeft: String(formData.get("previousSchoolDateLeft") ?? ""),
    previousSchoolLeavingReason: String(formData.get("previousSchoolLeavingReason") ?? ""),
    previousSchoolDetails: String(formData.get("previousSchoolDetails") ?? ""),
    fatherName: String(formData.get("fatherName") ?? ""),
    fatherOccupation: String(formData.get("fatherOccupation") ?? ""),
    fatherPhone: String(formData.get("fatherPhone") ?? ""),
    fatherEmail: String(formData.get("fatherEmail") ?? ""),
    fatherPhotoUrl: String(formData.get("fatherPhotoUrl") ?? ""),
    motherName: String(formData.get("motherName") ?? ""),
    motherOccupation: String(formData.get("motherOccupation") ?? ""),
    motherPhone: String(formData.get("motherPhone") ?? ""),
    motherEmail: String(formData.get("motherEmail") ?? ""),
    motherPhotoUrl: String(formData.get("motherPhotoUrl") ?? ""),
    guardianName: String(formData.get("guardianName") ?? ""),
    guardianRelationship: String(formData.get("guardianRelationship") ?? ""),
    guardianRelationKind: String(formData.get("guardianRelationKind") ?? ""),
    guardianPhone: String(formData.get("guardianPhone") ?? ""),
    guardianEmail: String(formData.get("guardianEmail") ?? ""),
    guardianOccupation: String(formData.get("guardianOccupation") ?? ""),
    guardianAddress: String(formData.get("guardianAddress") ?? ""),
    guardianPhotoUrl: String(formData.get("guardianPhotoUrl") ?? ""),
    documentBirthCert: String(formData.get("documentBirthCert") ?? ""),
    documentNationalId: String(formData.get("documentNationalId") ?? ""),
    documentTransferCert: String(formData.get("documentTransferCert") ?? ""),
    documentMedicalImmunization: String(formData.get("documentMedicalImmunization") ?? ""),
    documentOtherNotes: String(formData.get("documentOtherNotes") ?? ""),
    bankName: String(formData.get("bankName") ?? ""),
    bankAccountNumber: String(formData.get("bankAccountNumber") ?? ""),
    bankIfscCode: String(formData.get("bankIfscCode") ?? ""),
    documentAttach1Title: String(formData.get("documentAttach1Title") ?? ""),
    documentAttach1Url: String(formData.get("documentAttach1Url") ?? ""),
    documentAttach2Title: String(formData.get("documentAttach2Title") ?? ""),
    documentAttach2Url: String(formData.get("documentAttach2Url") ?? ""),
    documentAttach3Title: String(formData.get("documentAttach3Title") ?? ""),
    documentAttach3Url: String(formData.get("documentAttach3Url") ?? ""),
    documentAttach4Title: String(formData.get("documentAttach4Title") ?? ""),
    documentAttach4Url: String(formData.get("documentAttach4Url") ?? ""),
    transportRouteList: String(formData.get("transportRouteList") ?? ""),
    transportVehicleNumber: String(formData.get("transportVehicleNumber") ?? ""),
    dormitoryName: String(formData.get("dormitoryName") ?? ""),
    dormitoryRoomNumber: String(formData.get("dormitoryRoomNumber") ?? ""),
    admissionNotes: String(formData.get("admissionNotes") ?? ""),
  };

  const parsed = studentAdmissionFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const data = parsed.data;
  if (!(await canManageInstitution(userId, isSuperAdmin, data.institutionId))) {
    return { ok: false, message: "You cannot add students for this school." };
  }

  const primaryAddress =
    data.currentAddress?.trim() || data.permanentAddress?.trim() || null;

  const id = crypto.randomUUID();
  const db = getDb();

  try {
    await db.insert(students).values({
      id,
      institutionId: data.institutionId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      middleName: data.middleName?.trim() || null,
      dateOfBirth: data.dateOfBirth ?? null,
      gender: data.gender.trim(),
      email: data.email?.trim() || null,
      phone: data.phone.trim(),
      address: primaryAddress,
      academicYear: data.academicYear?.trim() || null,
      admissionClassLabel: data.admissionClassLabel?.trim() || null,
      admissionSectionLabel: data.admissionSectionLabel?.trim() || null,
      rollNumber: data.rollNumber?.trim() || null,
      studentGroup: data.studentGroup?.trim() || null,
      religion: data.religion?.trim() || null,
      caste: data.caste?.trim() || null,
      currentAddress: data.currentAddress?.trim() || null,
      permanentAddress: data.permanentAddress?.trim() || null,
      medicalCategory: data.medicalCategory?.trim() || null,
      heightIn: data.heightIn?.trim() || null,
      weightKg: data.weightKg?.trim() || null,
      photoUrl: data.photoUrl?.trim() || null,
      admissionNumber: data.admissionNumber?.trim() || null,
      admissionDate: data.admissionDate ?? null,
      bloodGroup: data.bloodGroup?.trim() || null,
      previousSchool: data.previousSchool?.trim() || null,
      previousSchoolAddress: data.previousSchoolAddress?.trim() || null,
      previousSchoolClassOrGrade: data.previousSchoolClassOrGrade?.trim() || null,
      previousSchoolDateLeft: data.previousSchoolDateLeft ?? null,
      previousSchoolLeavingReason: data.previousSchoolLeavingReason?.trim() || null,
      previousSchoolDetails: data.previousSchoolDetails?.trim() || null,
      fatherName: data.fatherName.trim(),
      fatherOccupation: data.fatherOccupation?.trim() || null,
      fatherPhone: data.fatherPhone?.trim() || null,
      fatherEmail: data.fatherEmail?.trim() || null,
      fatherPhotoUrl: data.fatherPhotoUrl?.trim() || null,
      motherName: data.motherName?.trim() || null,
      motherOccupation: data.motherOccupation?.trim() || null,
      motherPhone: data.motherPhone?.trim() || null,
      motherEmail: data.motherEmail?.trim() || null,
      motherPhotoUrl: data.motherPhotoUrl?.trim() || null,
      guardianName: data.guardianName?.trim() || null,
      guardianRelationship:
        data.guardianRelationKind === "other" ? data.guardianRelationship?.trim() || null : null,
      guardianRelationKind: data.guardianRelationKind,
      guardianPhone: data.guardianPhone?.trim() || null,
      guardianEmail: data.guardianEmail?.trim() || null,
      guardianOccupation: data.guardianOccupation?.trim() || null,
      guardianAddress: data.guardianAddress?.trim() || null,
      guardianPhotoUrl: data.guardianPhotoUrl?.trim() || null,
      documentBirthCert: data.documentBirthCert?.trim() || null,
      documentNationalId: data.documentNationalId?.trim() || null,
      documentTransferCert: data.documentTransferCert?.trim() || null,
      documentMedicalImmunization: data.documentMedicalImmunization?.trim() || null,
      documentOtherNotes: data.documentOtherNotes?.trim() || null,
      bankName: data.bankName?.trim() || null,
      bankAccountNumber: data.bankAccountNumber?.trim() || null,
      bankIfscCode: data.bankIfscCode?.trim() || null,
      documentAttach1Title: data.documentAttach1Title?.trim() || null,
      documentAttach1Url: data.documentAttach1Url?.trim() || null,
      documentAttach2Title: data.documentAttach2Title?.trim() || null,
      documentAttach2Url: data.documentAttach2Url?.trim() || null,
      documentAttach3Title: data.documentAttach3Title?.trim() || null,
      documentAttach3Url: data.documentAttach3Url?.trim() || null,
      documentAttach4Title: data.documentAttach4Title?.trim() || null,
      documentAttach4Url: data.documentAttach4Url?.trim() || null,
      transportRouteList: data.transportRouteList?.trim() || null,
      transportVehicleNumber: data.transportVehicleNumber?.trim() || null,
      dormitoryName: data.dormitoryName?.trim() || null,
      dormitoryRoomNumber: data.dormitoryRoomNumber?.trim() || null,
      admissionNotes: data.admissionNotes?.trim() || null,
      participantEntryId: null,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    return { ok: false, message: "Could not save this student. Please try again." };
  }

  revalidatePath("/evaluations");
  revalidatePath(`/evaluations/students/${data.institutionId}`);
  revalidatePath("/students");
  revalidatePath("/attendance");
  revalidatePath("/students/attendance");
  revalidatePath("/examinations");

  return {
    ok: true,
    message: "Student admitted and saved.",
    studentId: id,
  };
}

export async function setStudentEnrollment(
  studentId: string,
  classId: string,
  enrolled: boolean,
): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  const db = getDb();
  const [st] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!st) throw new Error("Student not found.");
  if (!(await canManageInstitution(userId, isSuperAdmin, st.institutionId))) {
    throw new Error("Not allowed.");
  }
  const [cl] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  if (!cl || cl.institutionId !== st.institutionId) throw new Error("Invalid class.");

  if (enrolled) {
    const existing = await db
      .select()
      .from(studentClasses)
      .where(and(eq(studentClasses.studentId, studentId), eq(studentClasses.classId, classId)))
      .limit(1);
    if (!existing.length) {
      await db.insert(studentClasses).values({ studentId, classId });
    }
  } else {
    await db
      .delete(studentClasses)
      .where(and(eq(studentClasses.studentId, studentId), eq(studentClasses.classId, classId)));
  }
  revalidatePath("/evaluations");
  revalidatePath(`/evaluations/students/${st.institutionId}`);
}

export async function addPerformanceRecord(formData: FormData): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  const institutionId = String(formData.get("institutionId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const classIdRaw = String(formData.get("classId") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const scoreRaw = String(formData.get("score") ?? "").trim();
  const maxRaw = String(formData.get("maxScore") ?? "100").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const recordedAtRaw = String(formData.get("recordedAt") ?? "").trim();

  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("You cannot add scores for this school.");
  }
  if (!studentId || !category) throw new Error("Student and category are required.");
  const score = Number(scoreRaw);
  const maxScore = Number(maxRaw) || 100;
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore < 1) {
    throw new Error("Invalid score.");
  }

  const db = getDb();
  const [st] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!st || st.institutionId !== institutionId) throw new Error("Invalid student.");

  const classId: string | null = classIdRaw || null;
  if (classId) {
    const [cl] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
    if (!cl || cl.institutionId !== institutionId) throw new Error("Invalid class.");
  }

  const recordedAt = recordedAtRaw ? new Date(recordedAtRaw) : new Date();
  if (Number.isNaN(recordedAt.getTime())) throw new Error("Invalid date.");

  await db.insert(performanceRecords).values({
    id: crypto.randomUUID(),
    studentId,
    classId,
    category,
    score: Math.round(score),
    maxScore: Math.round(maxScore),
    notes,
    recordedAt,
    recordedByUserId: userId,
    createdAt: new Date(),
  });

  revalidatePath("/evaluations");
  revalidatePath(`/evaluations/students/${institutionId}`);
}
