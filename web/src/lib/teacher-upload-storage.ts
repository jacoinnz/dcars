import { del, get, put } from "@vercel/blob";

const INLINE_MAX_BYTES = 2 * 1024 * 1024;
const BLOB_MAX_BYTES = 15 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._\-\s]+/g, "_").trim() || "upload";
  return base.slice(0, 180);
}

export type StoredTeacherFile =
  | { storageKind: "blob"; blobUrl: string }
  | { storageKind: "inline"; inlineBase64: string };

export function teacherRowToStored(row: {
  storageKind: string;
  blobUrl: string | null;
  inlineBase64: string | null;
}): StoredTeacherFile {
  if (row.storageKind === "blob" && row.blobUrl) {
    return { storageKind: "blob", blobUrl: row.blobUrl };
  }
  if (row.storageKind === "inline" && row.inlineBase64) {
    return { storageKind: "inline", inlineBase64: row.inlineBase64 };
  }
  throw new Error("Invalid stored file reference.");
}

export async function storeTeacherUploadFile(
  file: File,
  uploadId: string,
): Promise<{ stored: StoredTeacherFile; size: number; mime: string }> {
  const mime = file.type || "application/octet-stream";
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    if (file.size > BLOB_MAX_BYTES) {
      throw new Error(`File is too large (max ${Math.floor(BLOB_MAX_BYTES / (1024 * 1024))}MB).`);
    }
    const safe = sanitizeFilename(file.name);
    const blob = await put(`teacher-content/${uploadId}/${safe}`, file, {
      access: "private",
      token,
      addRandomSuffix: true,
    });
    return {
      stored: { storageKind: "blob", blobUrl: blob.url },
      size: file.size,
      mime,
    };
  }

  if (file.size > INLINE_MAX_BYTES) {
    throw new Error(
      `File is too large for database storage (max ${INLINE_MAX_BYTES / (1024 * 1024)}MB). Set BLOB_READ_WRITE_TOKEN for larger files.`,
    );
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    stored: { storageKind: "inline", inlineBase64: buf.toString("base64") },
    size: file.size,
    mime,
  };
}

export async function deleteStoredTeacherFile(stored: StoredTeacherFile): Promise<void> {
  if (stored.storageKind === "blob") {
    try {
      await del(stored.blobUrl);
    } catch (e) {
      console.error("Blob delete failed:", e);
    }
    return;
  }
}

export async function readTeacherFileBody(stored: StoredTeacherFile): Promise<Uint8Array> {
  if (stored.storageKind === "inline") {
    return new Uint8Array(Buffer.from(stored.inlineBase64, "base64"));
  }
  const result = await get(stored.blobUrl, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Could not read file from storage.");
  }
  const ab = await new Response(result.stream).arrayBuffer();
  return new Uint8Array(ab);
}
