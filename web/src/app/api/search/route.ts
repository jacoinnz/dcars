import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions, students } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { getViewableInstitutionIds } from "@/lib/school-access";

function likePattern(raw: string): string {
  const t = raw.trim().slice(0, 80).replace(/[%_\\]/g, "");
  return `%${t}%`;
}

export type SearchStudentHit = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  admissionNumber: string | null;
  institutionId: string;
  schoolName: string;
};

export type SearchSchoolHit = {
  id: string;
  name: string;
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ students: [] as SearchStudentHit[], schools: [] as SearchSchoolHit[] });
  }

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewableIds = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (viewableIds.length === 0) {
    return NextResponse.json({ students: [], schools: [] });
  }

  const pattern = likePattern(q);
  const db = getDb();

  const studentRows = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      middleName: students.middleName,
      admissionNumber: students.admissionNumber,
      institutionId: students.institutionId,
      schoolName: institutions.name,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .where(
      and(
        inArray(students.institutionId, viewableIds),
        or(
          ilike(students.firstName, pattern),
          ilike(students.lastName, pattern),
          ilike(students.middleName, pattern),
          ilike(students.admissionNumber, pattern),
          ilike(students.email, pattern),
          ilike(students.phone, pattern),
        ),
      ),
    )
    .limit(15);

  const schoolRows = await db
    .select({ id: institutions.id, name: institutions.name })
    .from(institutions)
    .where(and(inArray(institutions.id, viewableIds), ilike(institutions.name, pattern)))
    .limit(8);

  const studentsOut: SearchStudentHit[] = studentRows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    middleName: r.middleName,
    admissionNumber: r.admissionNumber,
    institutionId: r.institutionId,
    schoolName: r.schoolName,
  }));

  return NextResponse.json({
    students: studentsOut,
    schools: schoolRows,
  });
}
