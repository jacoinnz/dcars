"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions";
import { submitSessionReport } from "@/app/actions";

type SiteOption = { id: string; name: string; code: string };

export function SessionEntryForm(props: {
  sites: SiteOption[];
  defaultSessionDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitSessionReport,
    undefined as ActionState | undefined,
  );

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-stone-900">Session report</h1>
        <p className="text-sm text-stone-600">
          Submit one row per delivery day. Figures should match your site register.
        </p>
      </div>

      {state?.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {state.message}
        </div>
      ) : null}

      {!state?.ok && state?.message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {state.message}
        </div>
      ) : null}

      {props.sites.length === 0 ? (
        <p className="text-sm text-red-800">
          No sites are configured yet. Add <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">DATABASE_URL</code>{" "}
          (Neon) to <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">.env.local</code>, then run{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">npm run db:push</code> and{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">npm run db:seed</code> from the{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">web</code> folder.
        </p>
      ) : null}

      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-800">Site</span>
        <select
          name="siteId"
          required
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select a site…
          </option>
          {props.sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
        {fieldErrors?.siteId ? (
          <span className="text-xs text-red-700">{fieldErrors.siteId.join(" ")}</span>
        ) : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-800">Facilitator name</span>
        <input
          name="facilitatorName"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="Your full name"
        />
        {fieldErrors?.facilitatorName ? (
          <span className="text-xs text-red-700">{fieldErrors.facilitatorName.join(" ")}</span>
        ) : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-800">Session date</span>
        <input
          name="sessionDate"
          type="date"
          required
          defaultValue={props.defaultSessionDate}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        {fieldErrors?.sessionDate ? (
          <span className="text-xs text-red-700">{fieldErrors.sessionDate.join(" ")}</span>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Youth registered</span>
          <input
            name="youthRegistered"
            type="number"
            inputMode="numeric"
            min={0}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          {fieldErrors?.youthRegistered ? (
            <span className="text-xs text-red-700">{fieldErrors.youthRegistered.join(" ")}</span>
          ) : null}
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Youth present</span>
          <input
            name="youthPresent"
            type="number"
            inputMode="numeric"
            min={0}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          {fieldErrors?.youthPresent ? (
            <span className="text-xs text-red-700">{fieldErrors.youthPresent.join(" ")}</span>
          ) : null}
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-800">Sessions delivered (count)</span>
        <input
          name="sessionsDelivered"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={1}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        {fieldErrors?.sessionsDelivered ? (
          <span className="text-xs text-red-700">{fieldErrors.sessionsDelivered.join(" ")}</span>
        ) : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-800">Notes (optional)</span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="Highlights, incidents, follow-ups…"
        />
        {fieldErrors?.notes ? (
          <span className="text-xs text-red-700">{fieldErrors.notes.join(" ")}</span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={pending || props.sites.length === 0}
        className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Submit report"}
      </button>
    </form>
  );
}
