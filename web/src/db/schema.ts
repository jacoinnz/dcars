import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const sites = pgTable("sites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** Application login accounts. */
export const appUsers = pgTable("app_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** Per-site CRUD flags. Super admins bypass this table for access checks. */
export const siteUserPermissions = pgTable(
  "site_user_permissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    canView: boolean("can_view").notNull().default(true),
    canCreate: boolean("can_create").notNull().default(false),
    canUpdate: boolean("can_update").notNull().default(false),
    canDelete: boolean("can_delete").notNull().default(false),
  },
  (t) => [uniqueIndex("site_user_permissions_user_site_uq").on(t.userId, t.siteId)],
);

export const facilitators = pgTable("facilitators", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const sessionReports = pgTable("session_reports", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  facilitatorId: text("facilitator_id")
    .notNull()
    .references(() => facilitators.id, { onDelete: "cascade" }),
  /** Calendar date (YYYY-MM-DD) */
  sessionDate: date("session_date", { mode: "string" }).notNull(),
  youthRegistered: integer("youth_registered").notNull(),
  youthPresent: integer("youth_present").notNull(),
  sessionsDelivered: integer("sessions_delivered").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** One row per youth participant registration; `id` is the public reference UUID. */
export const participantEntries = pgTable("participant_entries", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  dateOfEntry: date("date_of_entry", { mode: "string" }).notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  institutionName: text("institution_name").notNull(),
  dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
  ethnicGroup: text("ethnic_group").notNull(),
  town: text("town").notNull(),
  pointOfContact: text("point_of_contact").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  emergencyContactNumber: text("emergency_contact_number").notNull(),
  studentContactNumber: text("student_contact_number").notNull(),
  nextOfKin: text("next_of_kin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** Files uploaded by staff, scoped to programme site + school/institution name. */
export const teacherContentUploads = pgTable("teacher_content_uploads", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  institutionName: text("institution_name").notNull(),
  title: text("title"),
  description: text("description"),
  fileName: text("file_name").notNull(),
  fileMime: text("file_mime").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedByUserId: text("uploaded_by_user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  /** `blob` = Vercel Blob URL; `inline` = base64 in DB (dev / no token). */
  storageKind: text("storage_kind").notNull(),
  blobUrl: text("blob_url"),
  inlineBase64: text("inline_base64"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** School / college under a programme site (distinct from free-text institution on participants). */
export const institutions = pgTable("institutions", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const students = pgTable(
  "students",
  {
    id: text("id").primaryKey(),
    institutionId: text("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    middleName: text("middle_name"),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    gender: text("gender"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    /** School admission / roll reference number. */
    admissionNumber: text("admission_number"),
    admissionDate: date("admission_date", { mode: "string" }),
    bloodGroup: text("blood_group"),
    previousSchool: text("previous_school"),
    previousSchoolAddress: text("previous_school_address"),
    /** Last class, grade, year, or form attended. */
    previousSchoolClassOrGrade: text("previous_school_class_or_grade"),
    previousSchoolDateLeft: date("previous_school_date_left", { mode: "string" }),
    previousSchoolLeavingReason: text("previous_school_leaving_reason"),
    fatherName: text("father_name"),
    fatherOccupation: text("father_occupation"),
    fatherPhone: text("father_phone"),
    fatherEmail: text("father_email"),
    motherName: text("mother_name"),
    motherOccupation: text("mother_occupation"),
    motherPhone: text("mother_phone"),
    motherEmail: text("mother_email"),
    guardianName: text("guardian_name"),
    /** e.g. uncle, grandparent, foster parent */
    guardianRelationship: text("guardian_relationship"),
    guardianPhone: text("guardian_phone"),
    guardianEmail: text("guardian_email"),
    /** Document references supplied at admission (IDs, cert numbers); not file blobs. */
    documentBirthCert: text("document_birth_cert"),
    documentNationalId: text("document_national_id"),
    documentTransferCert: text("document_transfer_cert"),
    documentMedicalImmunization: text("document_medical_immunization"),
    documentOtherNotes: text("document_other_notes"),
    admissionNotes: text("admission_notes"),
    participantEntryId: text("participant_entry_id").references(() => participantEntries.id, {
      onDelete: "set null",
    }),
    /** Optional login (`app_users`) for the student portal (`/student`). */
    portalUserId: text("portal_user_id").references(() => appUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("students_portal_user_uq").on(t.portalUserId)],
);

export const studentClasses = pgTable(
  "student_classes",
  {
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("student_classes_student_class_uq").on(t.studentId, t.classId)],
);

/** Teachers / management assigned to a school for evaluations access. */
export const institutionStaff = pgTable(
  "institution_staff",
  {
    id: text("id").primaryKey(),
    institutionId: text("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
  },
  (t) => [uniqueIndex("institution_staff_institution_user_uq").on(t.institutionId, t.userId)],
);

/** Curriculum / syllabus documents scoped to one school (institution). */
export const institutionSyllabuses = pgTable("institution_syllabuses", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary"),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** Optional messaging for families (expectations, bell times) shown on the family attendance page. */
export const institutionAttendanceSettings = pgTable("institution_attendance_settings", {
  institutionId: text("institution_id")
    .primaryKey()
    .references(() => institutions.id, { onDelete: "cascade" }),
  familyInstructions: text("family_instructions"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** Links an app user (parent/guardian) to a student for read-only attendance visibility. */
export const studentGuardians = pgTable(
  "student_guardians",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    guardianUserId: text("guardian_user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    relationshipLabel: text("relationship_label"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("student_guardians_student_guardian_uq").on(t.studentId, t.guardianUserId)],
);

/** One roll-mark per student per calendar day (school day). */
export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    sessionDate: date("session_date", { mode: "string" }).notNull(),
    status: text("status").notNull(),
    notes: text("notes"),
    recordedByUserId: text("recorded_by_user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("attendance_student_day_uq").on(t.studentId, t.sessionDate)],
);

/** Named exam period at a school (routine, schedule, seat plan, marks). */
export const institutionExamSeries = pgTable("institution_exam_series", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  /** General exam routine / rules narrative. */
  routineBody: text("routine_body"),
  /** Notice text shown above the dated timetable (e.g. reporting time). */
  scheduleNoticeBody: text("schedule_notice_body"),
  /** Seating arrangement narrative or table. */
  seatPlanBody: text("seat_plan_body"),
  /** Tab-separated paper titles for the mark sheet when not inferrable from the schedule. */
  markSheetColumns: text("mark_sheet_columns"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** One row per paper/session in the dated & timed schedule. */
export const examScheduleSlots = pgTable("exam_schedule_slots", {
  id: text("id").primaryKey(),
  examSeriesId: text("exam_series_id")
    .notNull()
    .references(() => institutionExamSeries.id, { onDelete: "cascade" }),
  paperName: text("paper_name").notNull(),
  examDate: date("exam_date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  venue: text("venue"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Marks for one student / paper within an exam series (mark sheet data). */
export const examMarks = pgTable(
  "exam_marks",
  {
    id: text("id").primaryKey(),
    examSeriesId: text("exam_series_id")
      .notNull()
      .references(() => institutionExamSeries.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    paperName: text("paper_name").notNull(),
    score: integer("score").notNull(),
    maxScore: integer("max_score").notNull().default(100),
    notes: text("notes"),
    recordedByUserId: text("recorded_by_user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("exam_marks_series_student_paper_uq").on(t.examSeriesId, t.studentId, t.paperName)],
);

/** Programme-wide announcements shown on the home / dashboard notice board. */
export const noticeBoardItems = pgTable("notice_board_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  /** When set, the notice is hidden after this time. */
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  createdByUserId: text("created_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
});

/** Visitor sign-in/out register (front office). */
export const visitorBookEntries = pgTable("visitor_book_entries", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  visitorName: text("visitor_name").notNull(),
  phone: text("phone"),
  company: text("company"),
  purpose: text("purpose").notNull(),
  personToSee: text("person_to_see"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  badgeNumber: text("badge_number"),
  timeIn: timestamp("time_in", { withTimezone: true, mode: "date" }).notNull(),
  timeOut: timestamp("time_out", { withTimezone: true, mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  createdByUserId: text("created_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
});

/** School notices: holidays, events, out-of-class activities. */
export const institutionNotices = pgTable("institution_notices", {
  id: text("id").primaryKey(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  /** `holiday` | `event` | `out_of_class` */
  noticeType: text("notice_type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

/** Numeric scores for evaluation reports (per student; optionally tied to a class). */
export const performanceRecords = pgTable("performance_records", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  category: text("category").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull().default(100),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at", { withTimezone: true, mode: "date" }).notNull(),
  recordedByUserId: text("recorded_by_user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const sitesRelations = relations(sites, ({ many }) => ({
  facilitators: many(facilitators),
  sessionReports: many(sessionReports),
  participantEntries: many(participantEntries),
  siteUserPermissions: many(siteUserPermissions),
  teacherContentUploads: many(teacherContentUploads),
  institutions: many(institutions),
}));

export const appUsersRelations = relations(appUsers, ({ many, one }) => ({
  sitePermissions: many(siteUserPermissions),
  teacherContentUploads: many(teacherContentUploads),
  institutionStaffRows: many(institutionStaff),
  studentGuardianLinks: many(studentGuardians),
  noticeBoardItemsAuthored: many(noticeBoardItems),
  studentPortalProfile: one(students, {
    fields: [appUsers.id],
    references: [students.portalUserId],
  }),
}));

export const noticeBoardItemsRelations = relations(noticeBoardItems, ({ one }) => ({
  createdBy: one(appUsers, {
    fields: [noticeBoardItems.createdByUserId],
    references: [appUsers.id],
  }),
}));

export const siteUserPermissionsRelations = relations(siteUserPermissions, ({ one }) => ({
  user: one(appUsers, {
    fields: [siteUserPermissions.userId],
    references: [appUsers.id],
  }),
  site: one(sites, {
    fields: [siteUserPermissions.siteId],
    references: [sites.id],
  }),
}));

export const facilitatorsRelations = relations(facilitators, ({ one, many }) => ({
  site: one(sites, {
    fields: [facilitators.siteId],
    references: [sites.id],
  }),
  sessionReports: many(sessionReports),
}));

export const sessionReportsRelations = relations(sessionReports, ({ one }) => ({
  site: one(sites, {
    fields: [sessionReports.siteId],
    references: [sites.id],
  }),
  facilitator: one(facilitators, {
    fields: [sessionReports.facilitatorId],
    references: [facilitators.id],
  }),
}));

export const participantEntriesRelations = relations(participantEntries, ({ one }) => ({
  site: one(sites, {
    fields: [participantEntries.siteId],
    references: [sites.id],
  }),
}));

export const teacherContentUploadsRelations = relations(teacherContentUploads, ({ one }) => ({
  site: one(sites, {
    fields: [teacherContentUploads.siteId],
    references: [sites.id],
  }),
  uploadedBy: one(appUsers, {
    fields: [teacherContentUploads.uploadedByUserId],
    references: [appUsers.id],
  }),
}));

export const institutionsRelations = relations(institutions, ({ one, many }) => ({
  site: one(sites, {
    fields: [institutions.siteId],
    references: [sites.id],
  }),
  classes: many(classes),
  students: many(students),
  staff: many(institutionStaff),
  syllabuses: many(institutionSyllabuses),
  examSeries: many(institutionExamSeries),
  notices: many(institutionNotices),
  attendanceSettings: one(institutionAttendanceSettings, {
    fields: [institutions.id],
    references: [institutionAttendanceSettings.institutionId],
  }),
}));

export const institutionSyllabusesRelations = relations(institutionSyllabuses, ({ one }) => ({
  institution: one(institutions, {
    fields: [institutionSyllabuses.institutionId],
    references: [institutions.id],
  }),
}));

export const institutionExamSeriesRelations = relations(institutionExamSeries, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [institutionExamSeries.institutionId],
    references: [institutions.id],
  }),
  scheduleSlots: many(examScheduleSlots),
  marks: many(examMarks),
}));

export const examScheduleSlotsRelations = relations(examScheduleSlots, ({ one }) => ({
  series: one(institutionExamSeries, {
    fields: [examScheduleSlots.examSeriesId],
    references: [institutionExamSeries.id],
  }),
}));

export const examMarksRelations = relations(examMarks, ({ one }) => ({
  series: one(institutionExamSeries, {
    fields: [examMarks.examSeriesId],
    references: [institutionExamSeries.id],
  }),
  student: one(students, {
    fields: [examMarks.studentId],
    references: [students.id],
  }),
  recordedBy: one(appUsers, {
    fields: [examMarks.recordedByUserId],
    references: [appUsers.id],
  }),
}));

export const institutionNoticesRelations = relations(institutionNotices, ({ one }) => ({
  institution: one(institutions, {
    fields: [institutionNotices.institutionId],
    references: [institutions.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [classes.institutionId],
    references: [institutions.id],
  }),
  studentLinks: many(studentClasses),
  performanceRecords: many(performanceRecords),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [students.institutionId],
    references: [institutions.id],
  }),
  portalUser: one(appUsers, {
    fields: [students.portalUserId],
    references: [appUsers.id],
  }),
  participantEntry: one(participantEntries, {
    fields: [students.participantEntryId],
    references: [participantEntries.id],
  }),
  classLinks: many(studentClasses),
  performanceRecords: many(performanceRecords),
  examMarks: many(examMarks),
  guardians: many(studentGuardians),
  attendanceRecords: many(attendanceRecords),
}));

export const studentClassesRelations = relations(studentClasses, ({ one }) => ({
  student: one(students, {
    fields: [studentClasses.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [studentClasses.classId],
    references: [classes.id],
  }),
}));

export const institutionStaffRelations = relations(institutionStaff, ({ one }) => ({
  institution: one(institutions, {
    fields: [institutionStaff.institutionId],
    references: [institutions.id],
  }),
  user: one(appUsers, {
    fields: [institutionStaff.userId],
    references: [appUsers.id],
  }),
}));

export const performanceRecordsRelations = relations(performanceRecords, ({ one }) => ({
  student: one(students, {
    fields: [performanceRecords.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [performanceRecords.classId],
    references: [classes.id],
  }),
  recordedBy: one(appUsers, {
    fields: [performanceRecords.recordedByUserId],
    references: [appUsers.id],
  }),
}));

export const institutionAttendanceSettingsRelations = relations(
  institutionAttendanceSettings,
  ({ one }) => ({
    institution: one(institutions, {
      fields: [institutionAttendanceSettings.institutionId],
      references: [institutions.id],
    }),
  }),
);

export const studentGuardiansRelations = relations(studentGuardians, ({ one }) => ({
  student: one(students, {
    fields: [studentGuardians.studentId],
    references: [students.id],
  }),
  guardian: one(appUsers, {
    fields: [studentGuardians.guardianUserId],
    references: [appUsers.id],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  student: one(students, {
    fields: [attendanceRecords.studentId],
    references: [students.id],
  }),
  recordedBy: one(appUsers, {
    fields: [attendanceRecords.recordedByUserId],
    references: [appUsers.id],
  }),
}));
