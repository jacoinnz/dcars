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
      className="w-full space-y-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
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

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Parents &amp; guardian info</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Father name</span>
            <input name="fatherName" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.fatherName ? (
              <span className="text-xs text-red-700">{fieldErrors.fatherName.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Father occupation</span>
            <input name="fatherOccupation" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.fatherOccupation ? (
              <span className="text-xs text-red-700">{fieldErrors.fatherOccupation.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Father phone</span>
            <input name="fatherPhone" type="tel" inputMode="tel" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.fatherPhone ? (
              <span className="text-xs text-red-700">{fieldErrors.fatherPhone.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Father email</span>
            <input name="fatherEmail" type="email" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.fatherEmail ? (
              <span className="text-xs text-red-700">{fieldErrors.fatherEmail.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Mother name</span>
            <input name="motherName" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.motherName ? (
              <span className="text-xs text-red-700">{fieldErrors.motherName.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Mother occupation</span>
            <input name="motherOccupation" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.motherOccupation ? (
              <span className="text-xs text-red-700">{fieldErrors.motherOccupation.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Mother phone</span>
            <input name="motherPhone" type="tel" inputMode="tel" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.motherPhone ? (
              <span className="text-xs text-red-700">{fieldErrors.motherPhone.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Mother email</span>
            <input name="motherEmail" type="email" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.motherEmail ? (
              <span className="text-xs text-red-700">{fieldErrors.motherEmail.join(" ")}</span>
            ) : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Guardian name</span>
            <input name="guardianName" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.guardianName ? (
              <span className="text-xs text-red-700">{fieldErrors.guardianName.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Relationship</span>
            <input name="guardianRelationship" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" placeholder="e.g. uncle, grandparent" />
            {fieldErrors?.guardianRelationship ? (
              <span className="text-xs text-red-700">{fieldErrors.guardianRelationship.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Guardian phone</span>
            <input name="guardianPhone" type="tel" inputMode="tel" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.guardianPhone ? (
              <span className="text-xs text-red-700">{fieldErrors.guardianPhone.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Guardian email</span>
            <input name="guardianEmail" type="email" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.guardianEmail ? (
              <span className="text-xs text-red-700">{fieldErrors.guardianEmail.join(" ")}</span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Document info</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Birth certificate</span>
            <input name="documentBirthCert" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.documentBirthCert ? (
              <span className="text-xs text-red-700">{fieldErrors.documentBirthCert.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">National ID</span>
            <input name="documentNationalId" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.documentNationalId ? (
              <span className="text-xs text-red-700">{fieldErrors.documentNationalId.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Transfer certificate</span>
            <input name="documentTransferCert" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.documentTransferCert ? (
              <span className="text-xs text-red-700">{fieldErrors.documentTransferCert.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Medical / immunization</span>
            <input name="documentMedicalImmunization" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.documentMedicalImmunization ? (
              <span className="text-xs text-red-700">{fieldErrors.documentMedicalImmunization.join(" ")}</span>
            ) : null}
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Other document notes</span>
          <textarea name="documentOtherNotes" rows={2} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          {fieldErrors?.documentOtherNotes ? (
            <span className="text-xs text-red-700">{fieldErrors.documentOtherNotes.join(" ")}</span>
          ) : null}
        </label>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Previous school information</legend>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Previous school</span>
          <input name="previousSchool" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          {fieldErrors?.previousSchool ? (
            <span className="text-xs text-red-700">{fieldErrors.previousSchool.join(" ")}</span>
          ) : null}
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Previous school address</span>
          <textarea name="previousSchoolAddress" rows={2} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          {fieldErrors?.previousSchoolAddress ? (
            <span className="text-xs text-red-700">{fieldErrors.previousSchoolAddress.join(" ")}</span>
          ) : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Last class / grade</span>
            <input name="previousSchoolClassOrGrade" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.previousSchoolClassOrGrade ? (
              <span className="text-xs text-red-700">{fieldErrors.previousSchoolClassOrGrade.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Date left</span>
            <input name="previousSchoolDateLeft" type="date" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.previousSchoolDateLeft ? (
              <span className="text-xs text-red-700">{fieldErrors.previousSchoolDateLeft.join(" ")}</span>
            ) : null}
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Leaving reason</span>
          <textarea name="previousSchoolLeavingReason" rows={2} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          {fieldErrors?.previousSchoolLeavingReason ? (
            <span className="text-xs text-red-700">{fieldErrors.previousSchoolLeavingReason.join(" ")}</span>
          ) : null}
        </label>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Admission notes</legend>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Notes</span>
          <textarea name="admissionNotes" rows={3} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          {fieldErrors?.admissionNotes ? (
            <span className="text-xs text-red-700">{fieldErrors.admissionNotes.join(" ")}</span>
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
