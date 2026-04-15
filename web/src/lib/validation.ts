import { z } from "zod";

/** Trim, NFKC-normalize (full-width digits → ASCII), strip invisible chars. */
function normalizePhoneInput(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s = String(v).trim().normalize("NFKC");
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  return s;
}

function countPhoneDigits(s: string): number {
  return s.replace(/\D/g, "").length;
}

/** Allow common formatting; validity is based on digit count, not raw string length. */
const phoneCharsOk = /^[\d\s\-+()./x,#;:]*$/i;

const phoneLike = z.preprocess(
  normalizePhoneInput,
  z
    .string()
    .max(40)
    .refine((s) => countPhoneDigits(s) >= 5 && countPhoneDigits(s) <= 18, "Enter a valid phone number")
    .refine((s) => phoneCharsOk.test(s), "Use digits and common phone characters only"),
);

const optionalMiddle = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().max(120).optional(),
);

const emptyToUndef = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const optionalDateYmd = z.preprocess(
  emptyToUndef,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
);

const optionalPhoneLoose = z.preprocess(
  (v) => {
    const n = normalizePhoneInput(emptyToUndef(v) ?? "");
    return n === "" ? undefined : n;
  },
  z
    .string()
    .max(40)
    .refine((s) => countPhoneDigits(s) >= 5 && countPhoneDigits(s) <= 18, "Enter a valid phone number")
    .refine((s) => phoneCharsOk.test(s), "Use digits and common phone characters only")
    .optional(),
);

const optionalEmailLoose = z.preprocess(
  emptyToUndef,
  z.string().email("Enter a valid email").max(200).optional(),
);

export const participantEntryFormSchema = z.object({
  siteId: z.string().min(1, "Select a site"),
  dateOfEntry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date of entry"),
  firstName: z.string().min(1, "First name is required").max(100),
  middleName: optionalMiddle,
  lastName: z.string().min(1, "Last name is required").max(100),
  institutionName: z.string().min(1, "School / college / institution is required").max(200),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date of birth"),
  ethnicGroup: z.string().min(1, "Ethnic group is required").max(120),
  town: z.string().min(1, "Town is required").max(120),
  pointOfContact: z.string().min(1, "Point of contact is required").max(200),
  emergencyContact: z.string().min(1, "Emergency contact name is required").max(200),
  emergencyContactNumber: phoneLike,
  studentContactNumber: phoneLike,
  nextOfKin: z.string().min(1, "Next of kin is required").max(200),
  fatherName: z.preprocess(emptyToUndef, z.string().max(120).optional()),
  fatherOccupation: z.preprocess(emptyToUndef, z.string().max(120).optional()),
  fatherPhone: optionalPhoneLoose,
  fatherEmail: optionalEmailLoose,
  motherName: z.preprocess(emptyToUndef, z.string().max(120).optional()),
  motherOccupation: z.preprocess(emptyToUndef, z.string().max(120).optional()),
  motherPhone: optionalPhoneLoose,
  motherEmail: optionalEmailLoose,
  guardianName: z.preprocess(emptyToUndef, z.string().max(120).optional()),
  guardianRelationship: z.preprocess(emptyToUndef, z.string().max(80).optional()),
  guardianPhone: optionalPhoneLoose,
  guardianEmail: optionalEmailLoose,
  documentBirthCert: z.preprocess(emptyToUndef, z.string().max(500).optional()),
  documentNationalId: z.preprocess(emptyToUndef, z.string().max(500).optional()),
  documentTransferCert: z.preprocess(emptyToUndef, z.string().max(500).optional()),
  documentMedicalImmunization: z.preprocess(emptyToUndef, z.string().max(500).optional()),
  documentOtherNotes: z.preprocess(emptyToUndef, z.string().max(2000).optional()),
  previousSchool: z.preprocess(emptyToUndef, z.string().max(300).optional()),
  previousSchoolAddress: z.preprocess(emptyToUndef, z.string().max(500).optional()),
  previousSchoolClassOrGrade: z.preprocess(emptyToUndef, z.string().max(120).optional()),
  previousSchoolDateLeft: optionalDateYmd,
  previousSchoolLeavingReason: z.preprocess(emptyToUndef, z.string().max(1000).optional()),
  admissionNotes: z.preprocess(emptyToUndef, z.string().max(2000).optional()),
});

export type ParticipantEntryFormInput = z.infer<typeof participantEntryFormSchema>;

/** School student admission — extended profile (optional fields typical of MIS admission screens). */
export const studentAdmissionFormSchema = z
  .object({
    institutionId: z.string().min(1, "School is required"),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    middleName: z.preprocess(emptyToUndef, z.string().max(100).optional()),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    dateOfBirth: optionalDateYmd,
    gender: z.preprocess(emptyToUndef, z.string().max(40).optional()),
    email: optionalEmailLoose,
    phone: optionalPhoneLoose,
    address: z.preprocess(emptyToUndef, z.string().max(500).optional()),
    admissionNumber: z.preprocess(emptyToUndef, z.string().max(80).optional()),
    admissionDate: optionalDateYmd,
    bloodGroup: z.preprocess(emptyToUndef, z.string().max(20).optional()),
    /** Form-only: "1" when UI includes second parent (mother_* fields required). */
    secondParentActive: z.preprocess(
      (v) => (String(v ?? "").trim() === "1" ? "1" : "0"),
      z.enum(["0", "1"]),
    ),
    previousSchool: z.preprocess(emptyToUndef, z.string().max(300).optional()),
    previousSchoolAddress: z.preprocess(emptyToUndef, z.string().max(500).optional()),
    previousSchoolClassOrGrade: z.preprocess(emptyToUndef, z.string().max(120).optional()),
    previousSchoolDateLeft: optionalDateYmd,
    previousSchoolLeavingReason: z.preprocess(emptyToUndef, z.string().max(1000).optional()),
    fatherName: z.preprocess(emptyToUndef, z.string().max(120).optional()),
    fatherOccupation: z.preprocess(emptyToUndef, z.string().max(120).optional()),
    fatherPhone: optionalPhoneLoose,
    fatherEmail: optionalEmailLoose,
    motherName: z.preprocess(emptyToUndef, z.string().max(120).optional()),
    motherOccupation: z.preprocess(emptyToUndef, z.string().max(120).optional()),
    motherPhone: optionalPhoneLoose,
    motherEmail: optionalEmailLoose,
    guardianName: z.preprocess(emptyToUndef, z.string().max(120).optional()),
    guardianRelationship: z.preprocess(emptyToUndef, z.string().max(80).optional()),
    guardianPhone: optionalPhoneLoose,
    guardianEmail: optionalEmailLoose,
    documentBirthCert: z.preprocess(emptyToUndef, z.string().max(500).optional()),
    documentNationalId: z.preprocess(emptyToUndef, z.string().max(500).optional()),
    documentTransferCert: z.preprocess(emptyToUndef, z.string().max(500).optional()),
    documentMedicalImmunization: z.preprocess(emptyToUndef, z.string().max(500).optional()),
    documentOtherNotes: z.preprocess(emptyToUndef, z.string().max(2000).optional()),
    admissionNotes: z.preprocess(emptyToUndef, z.string().max(2000).optional()),
  })
  .superRefine((data, ctx) => {
    if (data.secondParentActive !== "1") return;
    if (!data.motherName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Parent 2 full name is required when a second parent is included.",
        path: ["motherName"],
      });
    }
    const hasPhone =
      data.motherPhone != null &&
      String(data.motherPhone).trim().length > 0 &&
      countPhoneDigits(String(data.motherPhone)) >= 5;
    const hasEmail = data.motherEmail != null && String(data.motherEmail).trim().length > 0;
    if (!hasPhone && !hasEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a valid phone or an email for parent 2.",
        path: ["motherPhone"],
      });
    }
  });

export type StudentAdmissionFormInput = z.infer<typeof studentAdmissionFormSchema>;
