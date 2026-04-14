"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions";
import { submitParticipantEntry } from "@/app/actions";

type SiteOption = { id: string; name: string; code: string };

export function ParticipantEntryForm(props: {
  sites: SiteOption[];
  defaultDateOfEntry: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitParticipantEntry,
    undefined as ActionState | undefined,
  );

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-stone-900">Participant registration</h1>
        <p className="text-sm text-stone-600">
          One form per young person. Each submission is stored with its own unique ID.
        </p>
      </div>

      {state?.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <p>{state.message}</p>
          {state.entryId ? (
            <p className="mt-2 font-mono text-xs break-all text-emerald-950">{state.entryId}</p>
          ) : null}
        </div>
      ) : null}

      {!state?.ok && state?.message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {state.message}
        </div>
      ) : null}

      {props.sites.length === 0 ? (
        <p className="text-sm text-red-800">
          No sites are configured. Add <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">DATABASE_URL</code>{" "}
          and run <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">npm run db:push</code> /{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">npm run db:seed</code> in{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">web</code>.
        </p>
      ) : null}

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Programme & dates</legend>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Date of entry</span>
            <input
              name="dateOfEntry"
              type="date"
              required
              defaultValue={props.defaultDateOfEntry}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.dateOfEntry ? (
              <span className="text-xs text-red-700">{fieldErrors.dateOfEntry.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Date of birth</span>
            <input
              name="dateOfBirth"
              type="date"
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.dateOfBirth ? (
              <span className="text-xs text-red-700">{fieldErrors.dateOfBirth.join(" ")}</span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Name</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1 sm:col-span-1">
            <span className="text-sm font-medium text-stone-800">First name</span>
            <input
              name="firstName"
              required
              autoComplete="given-name"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.firstName ? (
              <span className="text-xs text-red-700">{fieldErrors.firstName.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1 sm:col-span-1">
            <span className="text-sm font-medium text-stone-800">Second / middle name</span>
            <input
              name="middleName"
              autoComplete="additional-name"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              placeholder="Optional"
            />
            {fieldErrors?.middleName ? (
              <span className="text-xs text-red-700">{fieldErrors.middleName.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1 sm:col-span-1">
            <span className="text-sm font-medium text-stone-800">Last name</span>
            <input
              name="lastName"
              required
              autoComplete="family-name"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.lastName ? (
              <span className="text-xs text-red-700">{fieldErrors.lastName.join(" ")}</span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Education & location</legend>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">School / college / institution</span>
          <input
            name="institutionName"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          {fieldErrors?.institutionName ? (
            <span className="text-xs text-red-700">{fieldErrors.institutionName.join(" ")}</span>
          ) : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Ethnic group</span>
            <input name="ethnicGroup" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.ethnicGroup ? (
              <span className="text-xs text-red-700">{fieldErrors.ethnicGroup.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Town</span>
            <input name="town" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.town ? (
              <span className="text-xs text-red-700">{fieldErrors.town.join(" ")}</span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Contacts</legend>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Point of contact</span>
          <input
            name="pointOfContact"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="Name or role"
          />
          {fieldErrors?.pointOfContact ? (
            <span className="text-xs text-red-700">{fieldErrors.pointOfContact.join(" ")}</span>
          ) : null}
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Contact number (student)</span>
          <input
            name="studentContactNumber"
            type="tel"
            inputMode="tel"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            autoComplete="tel"
          />
          {fieldErrors?.studentContactNumber ? (
            <span className="text-xs text-red-700">{fieldErrors.studentContactNumber.join(" ")}</span>
          ) : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Emergency contact</span>
            <input name="emergencyContact" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.emergencyContact ? (
              <span className="text-xs text-red-700">{fieldErrors.emergencyContact.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Emergency contact number</span>
            <input
              name="emergencyContactNumber"
              type="tel"
              inputMode="tel"
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.emergencyContactNumber ? (
              <span className="text-xs text-red-700">{fieldErrors.emergencyContactNumber.join(" ")}</span>
            ) : null}
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Next of kin</span>
          <textarea
            name="nextOfKin"
            required
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="Name and relationship"
          />
          {fieldErrors?.nextOfKin ? (
            <span className="text-xs text-red-700">{fieldErrors.nextOfKin.join(" ")}</span>
          ) : null}
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending || props.sites.length === 0}
        className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Submit registration"}
      </button>
    </form>
  );
}
