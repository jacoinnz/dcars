import { ParticipantEntryForm } from "@/components/participant-entry-form";
import { ParticipantExcelImport } from "@/components/participant-excel-import";
import { getSitesForParticipantEntry } from "@/lib/sites-for-user";
import { getSessionSiteScope } from "@/lib/site-scope";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const scopeCtx = await getSessionSiteScope();
  if (!scopeCtx) redirect("/login");
  const sites = await getSitesForParticipantEntry(scopeCtx.userId, scopeCtx.isSuperAdmin);
  const defaultDateOfEntry = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      {sites.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          <p className="font-semibold">No programme sites available</p>
          <p className="mt-2 text-amber-950/90">
            Your account does not have access to register participants for any site. Ask a
            super-administrator to grant you create permission for the sites you support.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          <ParticipantEntryForm sites={sites} defaultDateOfEntry={defaultDateOfEntry} />
          <ParticipantExcelImport />
        </div>
      )}
    </div>
  );
}
