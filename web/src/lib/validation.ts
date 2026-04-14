import { z } from "zod";

const phoneLike = z
  .string()
  .min(7, "Enter a valid phone number")
  .max(40)
  .regex(/^[\d\s\-+().]+$/, "Use digits and common phone characters only");

const optionalMiddle = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().max(120).optional(),
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
});

export type ParticipantEntryFormInput = z.infer<typeof participantEntryFormSchema>;
