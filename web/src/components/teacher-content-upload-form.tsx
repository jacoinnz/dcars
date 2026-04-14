"use client";

import { useActionState, useMemo, useState } from "react";
import type { TeacherUploadActionState } from "@/app/teacher-actions";
import { uploadTeacherContent } from "@/app/teacher-actions";

type SiteOpt = { id: string; name: string; code: string };

export function TeacherContentUploadForm(props: {
  sites: SiteOpt[];
  institutionsBySite: Record<string, string[]>;
  hasBlobToken: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    uploadTeacherContent,
    undefined as TeacherUploadActionState | undefined,
  );

  const siteIds = useMemo(() => props.sites.map((s) => s.id), [props.sites]);
  const defaultSiteId = siteIds[0] ?? "";
  const [siteId, setSiteId] = useState(defaultSiteId);
  const institutionSuggestions = props.institutionsBySite[siteId] ?? [];

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-stone-900">Upload for a school or institution</h2>
      <p className="mt-2 text-sm text-stone-600">
        Choose the programme site, then the school or college this file relates to. You can pick an
        existing name from registrations or type a new one.
      </p>
      {!props.hasBlobToken ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Large files: set <code className="rounded bg-amber-100 px-1">BLOB_READ_WRITE_TOKEN</code>{" "}
          (Vercel Blob). Without it, uploads are stored in the database with a{" "}
          {2}MB limit.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-stone-800">
          Programme site
          <select
            name="siteId"
            required
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          >
            {props.sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-stone-800">
          School / college / institution
          <input
            name="institutionName"
            required
            maxLength={200}
            list="institution-suggestions"
            placeholder="e.g. Riverside Academy"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <datalist id="institution-suggestions" key={siteId}>
            {institutionSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>

        <label className="block text-sm font-medium text-stone-800">
          Title <span className="font-normal text-stone-500">(optional)</span>
          <input
            name="title"
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="Short label for this file"
          />
        </label>

        <label className="block text-sm font-medium text-stone-800">
          Notes <span className="font-normal text-stone-500">(optional)</span>
          <textarea
            name="description"
            maxLength={2000}
            rows={2}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="Context for colleagues"
          />
        </label>

        <label className="block text-sm font-medium text-stone-800">
          File
          <input
            name="file"
            type="file"
            required
            className="mt-2 block w-full text-sm text-stone-700 file:mr-3 file:rounded-lg file:border file:border-stone-300 file:bg-stone-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-800"
          />
        </label>

        <button
          type="submit"
          disabled={pending || props.sites.length === 0}
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>

      {state?.ok === false ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {state.message}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
