import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { teacherContentUploads } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { canOnSite } from "@/lib/permissions";
import { canStudentPortalAccessTeacherUpload } from "@/lib/student-portal-access";
import { readTeacherFileBody, teacherRowToStored } from "@/lib/teacher-upload-storage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const db = getDb();
  const [row] = await db.select().from(teacherContentUploads).where(eq(teacherContentUploads.id, id)).limit(1);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canView = await canOnSite(
    session.user.id,
    Boolean(session.user.isSuperAdmin),
    row.siteId,
    "view",
  );
  const portalOk = await canStudentPortalAccessTeacherUpload(session.user.id, {
    siteId: row.siteId,
    institutionName: row.institutionName,
  });
  if (!canView && !portalOk) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Uint8Array;
  try {
    body = await readTeacherFileBody(teacherRowToStored(row));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not read file" }, { status: 500 });
  }

  const safeName = row.fileName.replace(/[^\x20-\x7E]+/g, "_").slice(0, 200);

  const buffer = Buffer.from(body);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": row.fileMime,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
