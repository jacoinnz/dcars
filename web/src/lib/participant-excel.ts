import { format, isValid, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import { participantEntryFormSchema, type ParticipantEntryFormInput } from "@/lib/validation";

/** Column headers for the Registrations sheet (row 1). Order matters for the template. */
export const PARTICIPANT_IMPORT_HEADERS = [
  "site_code",
  "date_of_entry",
  "first_name",
  "middle_name",
  "last_name",
  "institution_name",
  "date_of_birth",
  "ethnic_group",
  "town",
  "point_of_contact",
  "student_contact_number",
  "emergency_contact",
  "emergency_contact_number",
  "next_of_kin",
] as const;

export type ParticipantImportHeader = (typeof PARTICIPANT_IMPORT_HEADERS)[number];

const HEADER_SET = new Set<string>(PARTICIPANT_IMPORT_HEADERS);

function normalizeHeaderCell(h: unknown): string {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function formatDateYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Convert cell to display string; handles Excel dates and numeric phone fields. */
export function cellToImportString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return isValid(value) ? formatDateYmd(value) : "";
  }
  if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 30000 && value <= 60000) {
      const d = excelSerialToUtcDate(value);
      if (d && isValid(d)) return formatDateYmd(d);
    }
    const s = String(value);
    if (!/e/i.test(s) && Number.isInteger(value)) return s;
    return s;
  }
  return String(value).trim();
}

/** Excel 1900 serial date (whole days) → UTC date at noon to avoid TZ edge cases. */
function excelSerialToUtcDate(serial: number): Date | null {
  if (!Number.isFinite(serial)) return null;
  const days = Math.floor(serial);
  const ms = (days - 25569) * 86400 * 1000;
  const d = new Date(ms);
  return isValid(d) ? d : null;
}

export function buildParticipantTemplateBuffer(
  sites: { code: string; name: string }[],
  opts?: { exampleSiteCode?: string },
): Buffer {
  const exampleCode =
    opts?.exampleSiteCode ?? (sites[0]?.code ? String(sites[0].code).toUpperCase() : "SITE_CODE");

  const headerRow = [...PARTICIPANT_IMPORT_HEADERS];
  const exampleRow = [
    exampleCode,
    formatDateYmd(new Date()),
    "Jane",
    "",
    "Doe",
    "Example school or college",
    "2010-05-01",
    "Prefer not to say",
    "Example town",
    "Named staff contact",
    "07123456789",
    "Emergency name",
    "07123456788",
    "Parent / guardian (relationship)",
  ];

  const wb = XLSX.utils.book_new();

  const instructions = [
    ["Participant import — instructions"],
    [""],
    [
      "Use the Registrations sheet: one row per young person. Do not change the header row.",
    ],
    ["site_code must match a code from the Sites sheet (same letters as in the app)."],
    ["Dates: use YYYY-MM-DD or a standard Excel date. Phone: store as text if Excel drops a leading 0."],
    ["middle_name can be empty. Delete the example row before production import if you prefer."],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  const reg = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
  XLSX.utils.book_append_sheet(wb, reg, "Registrations");

  const siteRows = [["site_code", "site_name"], ...sites.map((s) => [s.code, s.name])];
  const wsSites = XLSX.utils.aoa_to_sheet(siteRows);
  XLSX.utils.book_append_sheet(wb, wsSites, "Sites");

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer);
}

export type ParsedImportRow = {
  rowNumber: number;
  raw: Record<ParticipantImportHeader, string>;
};

export type ParseWorkbookResult =
  | { ok: true; rows: ParsedImportRow[] }
  | { ok: false; message: string };

const MAX_IMPORT_ROWS = 500;

/**
 * Read workbook buffer; returns data rows from sheet "Registrations" (or first sheet) with 1-based row numbers.
 */
export function parseParticipantImportWorkbook(buffer: Buffer): ParseWorkbookResult {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: "buffer", cellDates: true, cellNF: false });
  } catch {
    return { ok: false, message: "Could not read this file. Use a .xlsx or .xls file." };
  }

  const name = wb.SheetNames.includes("Registrations")
    ? "Registrations"
    : wb.SheetNames[0];
  if (!name) {
    return { ok: false, message: "The workbook has no sheets." };
  }
  const sheet = wb.Sheets[name];
  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null | undefined)[]>(
    sheet,
    { header: 1, defval: "", raw: false },
  ) as unknown[][];

  if (!matrix.length) {
    return { ok: false, message: "The Registrations sheet is empty." };
  }

  const headerCells = (matrix[0] ?? []).map(normalizeHeaderCell);
  const colIndex: Partial<Record<ParticipantImportHeader, number>> = {};
  for (let c = 0; c < headerCells.length; c++) {
    const h = headerCells[c];
    if (HEADER_SET.has(h)) {
      const key = h as ParticipantImportHeader;
      if (colIndex[key] !== undefined) {
        return { ok: false, message: `Duplicate column header: ${h}` };
      }
      colIndex[key] = c;
    }
  }

  for (const req of PARTICIPANT_IMPORT_HEADERS) {
    if (colIndex[req] === undefined) {
      return {
        ok: false,
        message: `Missing column "${req}". Download a fresh template and keep the header row.`,
      };
    }
  }

  const rows: ParsedImportRow[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const line = matrix[r] ?? [];
    const raw = {} as Record<ParticipantImportHeader, string>;
    for (const key of PARTICIPANT_IMPORT_HEADERS) {
      const idx = colIndex[key]!;
      raw[key] = cellToImportString(line[idx]);
    }
    const allEmpty = PARTICIPANT_IMPORT_HEADERS.every((k) => raw[k] === "");
    if (allEmpty) continue;

    rows.push({ rowNumber: r + 1, raw });
    if (rows.length > MAX_IMPORT_ROWS) {
      return {
        ok: false,
        message: `Too many rows (max ${MAX_IMPORT_ROWS}). Split into multiple files.`,
      };
    }
  }

  if (rows.length === 0) {
    return { ok: false, message: "No data rows found under the header." };
  }

  return { ok: true, rows };
}

/** Map parsed cells + resolved site UUID through the same Zod rules as the web form. */
export function validateImportRow(
  row: ParsedImportRow,
  siteId: string,
): { ok: true; data: ParticipantEntryFormInput } | { ok: false; message: string } {
  const middle = row.raw.middle_name;
  const parsed = participantEntryFormSchema.safeParse({
    siteId,
    dateOfEntry: normalizeDateField(row.raw.date_of_entry),
    firstName: row.raw.first_name,
    middleName: middle === "" ? undefined : middle,
    lastName: row.raw.last_name,
    institutionName: row.raw.institution_name,
    dateOfBirth: normalizeDateField(row.raw.date_of_birth),
    ethnicGroup: row.raw.ethnic_group,
    town: row.raw.town,
    pointOfContact: row.raw.point_of_contact,
    emergencyContact: row.raw.emergency_contact,
    emergencyContactNumber: row.raw.emergency_contact_number,
    studentContactNumber: row.raw.student_contact_number,
    nextOfKin: row.raw.next_of_kin,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(first)
      .map(([k, v]) => `${k}: ${(v ?? []).join(" ")}`)
      .join("; ");
    return { ok: false, message: msg || "Validation failed." };
  }
  return { ok: true, data: parsed.data };
}

function normalizeDateField(s: string): string {
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  let d = parseISO(t);
  if (!isValid(d)) d = new Date(t);
  if (!isValid(d)) return t;
  return formatDateYmd(d);
}
