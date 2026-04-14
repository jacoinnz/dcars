"use client";

import { useActionState } from "react";
import type { ImportParticipantsResult } from "@/app/import-actions";
import { importParticipantsFromExcel } from "@/app/import-actions";

export function ParticipantExcelImport() {
  const [state, formAction, pending] = useActionState(
    importParticipantsFromExcel,
    undefined as ImportParticipantsResult | undefined,
  );

  return (
    <section className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-stone-900">Import from Excel</h2>
      <p className="mt-2 text-sm text-stone-600">
        Download the template, fill the <strong className="font-medium">Registrations</strong> sheet
        (keep the header row), then upload here. Each row creates one participant with a new unique
        ID. Site is selected using <strong className="font-medium">site_code</strong> from the
        Sites sheet — same codes as in the app.
      </p>

      <p className="mt-4">
        <a
          href="/api/participants/template"
          className="inline-flex items-center justify-center rounded-xl border border-teal-600 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-100"
        >
          Download Excel template
        </a>
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-stone-800">
          Spreadsheet (.xlsx or .xls)
          <input
            name="file"
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            required
            className="mt-2 block w-full text-sm text-stone-700 file:mr-3 file:rounded-lg file:border file:border-stone-300 file:bg-stone-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-800"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {pending ? "Importing…" : "Upload and import"}
        </button>
      </form>

      {state?.ok === false ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {state.message}
        </div>
      ) : null}

      {state?.ok === true ? (
        <div className="mt-4 space-y-2 text-sm">
          <div
            className={
              state.failed.length
                ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950"
                : "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-950"
            }
          >
            <p className="font-medium">
              Imported {state.imported} row{state.imported === 1 ? "" : "s"}.
              {state.failed.length > 0
                ? ` ${state.failed.length} row${state.failed.length === 1 ? "" : "s"} could not be imported.`
                : ""}
            </p>
          </div>
          {state.failed.length > 0 ? (
            <ul className="max-h-48 list-inside list-disc overflow-y-auto rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800">
              {state.failed.map((f, i) => (
                <li key={`${f.rowNumber}-${i}`}>
                  Row {f.rowNumber}: {f.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
