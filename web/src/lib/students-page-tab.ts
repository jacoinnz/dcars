/** Normalize `tab` from Next.js searchParams (string or repeated key). */
export function parseStudentsTab(raw: string | string[] | undefined): string {
  if (raw === undefined) return "";
  const s = Array.isArray(raw) ? raw[0] : raw;
  return (s ?? "").trim().toLowerCase();
}
