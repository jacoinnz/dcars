import { NextResponse } from "next/server";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { buildParticipantTemplateBuffer } from "@/lib/participant-excel";
import { getSitesForParticipantEntry } from "@/lib/sites-for-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteList = await getSitesForParticipantEntry(
    session.user.id,
    Boolean(session.user.isSuperAdmin),
  );
  const sites = siteList.map((s) => ({ code: s.code, name: s.name }));
  const exampleCode = sites[0]?.code ? String(sites[0].code).toUpperCase() : undefined;

  const buffer = buildParticipantTemplateBuffer(sites, { exampleSiteCode: exampleCode });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="participant-import-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
