import { ParticipantEntryForm } from "@/components/participant-entry-form";
import { getAllSites } from "@/lib/sites";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const sites = await getAllSites();
  const defaultDateOfEntry = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <ParticipantEntryForm sites={sites} defaultDateOfEntry={defaultDateOfEntry} />
    </div>
  );
}
