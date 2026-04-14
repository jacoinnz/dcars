"use client";

import { useActionState } from "react";
import type { StudentAdmissionState } from "@/app/evaluations/actions";
import { submitStudentAdmission } from "@/app/evaluations/actions";

export function StudentAdmissionForm(props: {
  institutionId: string;
  schoolName: string;
  defaultAdmissionDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitStudentAdmission,
    undefined as StudentAdmissionState | undefined,
  );

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="space-y-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <input type="hidden" name="institutionId" value={props.institutionId} />

      <div className="space-y-1 border-b border-stone-100 pb-4">
        <h2 className="text-lg font-semibold text-stone-900">Student admission</h2>
        <p className="text-sm text-stone-600">
          Complete the learner profile for <span className="font-medium text-stone-800">{props.schoolName}</span>.
          Required fields are marked; the rest help with records and family contact (similar layout to common school
          MIS admission screens).
        </p>
      </div>

      {state?.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <p>{state.message}</p>
          {state.studentId ? (
            <p className="mt-2 font-mono text-xs break-all text-emerald-950">Student ID: {state.studentId}</p>
          ) : null}
        </div>
      ) : null}

      {!state?.ok && state?.message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {state.message}
        </div>
      ) : null}

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Admission &amp; identity</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Admission date</span>
            <input
              name="admissionDate"
              type="date"
              defaultValue={props.defaultAdmissionDate}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.admissionDate ? (
              <span className="text-xs text-red-700">{fieldErrors.admissionDate.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Admission / roll number</span>
            <input
              name="admissionNumber"
              autoComplete="off"
              placeholder="e.g. 2026-0142"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.admissionNumber ? (
              <span className="text-xs text-red-700">{fieldErrors.admissionNumber.join(" ")}</span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Student name</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">First name *</span>
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
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Middle name</span>
            <input
              name="middleName"
              autoComplete="additional-name"
              placeholder="Optional"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.middleName ? (
              <span className="text-xs text-red-700">{fieldErrors.middleName.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Last name *</span>
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
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Date of birth</span>
            <input name="dateOfBirth" type="date" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {fieldErrors?.dateOfBirth ? (
              <span className="text-xs text-red-700">{fieldErrors.dateOfBirth.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Gender</span>
            <select name="gender" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" defaultValue="">
              <option value="">Select…</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Other">Other</option>
            </select>
            {fieldErrors?.gender ? (
              <span className="text-xs text-red-700">{fieldErrors.gender.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Blood group</span>
            <input
              name="bloodGroup"
              placeholder="e.g. O+"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.bloodGroup ? (
              <span className="text-xs text-red-700">{fieldErrors.bloodGroup.join(" ")}</span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Contact &amp; address</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Student email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.email ? (
              <span className="text-xs text-red-700">{fieldErrors.email.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Student phone</span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            {fieldErrors?.phone ? (
              <span className="text-xs text-red-700">{fieldErrors.phone.join(" ")}</span>
            ) : null}
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">Address</span>
          <textarea
            name="address"
            rows={3}
            autoComplete="street-address"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="Street, town, postcode"
          />
          {fieldErrors?.address ? (
            <span className="text-xs text-red-700">{fieldErrors.address.join(" ")}</span>
          ) : null}
        </label>
      </fieldset>

      <fieldset className="space-y-5 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Parent &amp; guardian information</legend>
        <p className="text-sm text-stone-600">
          Contact details for parents and, if applicable, a local guardian or nominee (same structure as typical school
          admission forms).
        </p>

        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600">Father</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-stone-800">Full name</span>
              <input
                name="fatherName"
                autoComplete="section-father name"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.fatherName ? (
                <span className="text-xs text-red-700">{fieldErrors.fatherName.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Occupation</span>
              <input name="fatherOccupation" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
              {fieldErrors?.fatherOccupation ? (
                <span className="text-xs text-red-700">{fieldErrors.fatherOccupation.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Phone</span>
              <input
                name="fatherPhone"
                type="tel"
                inputMode="tel"
                autoComplete="section-father tel"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.fatherPhone ? (
                <span className="text-xs text-red-700">{fieldErrors.fatherPhone.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-stone-800">Email</span>
              <input
                name="fatherEmail"
                type="email"
                autoComplete="section-father email"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.fatherEmail ? (
                <span className="text-xs text-red-700">{fieldErrors.fatherEmail.join(" ")}</span>
              ) : null}
            </label>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600">Mother</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-stone-800">Full name</span>
              <input
                name="motherName"
                autoComplete="section-mother name"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.motherName ? (
                <span className="text-xs text-red-700">{fieldErrors.motherName.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Occupation</span>
              <input name="motherOccupation" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
              {fieldErrors?.motherOccupation ? (
                <span className="text-xs text-red-700">{fieldErrors.motherOccupation.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Phone</span>
              <input
                name="motherPhone"
                type="tel"
                inputMode="tel"
                autoComplete="section-mother tel"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.motherPhone ? (
                <span className="text-xs text-red-700">{fieldErrors.motherPhone.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-stone-800">Email</span>
              <input
                name="motherEmail"
                type="email"
                autoComplete="section-mother email"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.motherEmail ? (
                <span className="text-xs text-red-700">{fieldErrors.motherEmail.join(" ")}</span>
              ) : null}
            </label>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600">Guardian / local guardian</h3>
          <p className="text-xs text-stone-600">
            Use when someone other than the parents above is the primary contact for school matters (e.g. grandparent,
            foster carer).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-stone-800">Guardian name</span>
              <input name="guardianName" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
              {fieldErrors?.guardianName ? (
                <span className="text-xs text-red-700">{fieldErrors.guardianName.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-stone-800">Relationship to student</span>
              <input
                name="guardianRelationship"
                placeholder="e.g. Grandmother, uncle, foster parent"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.guardianRelationship ? (
                <span className="text-xs text-red-700">{fieldErrors.guardianRelationship.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Phone</span>
              <input name="guardianPhone" type="tel" inputMode="tel" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
              {fieldErrors?.guardianPhone ? (
                <span className="text-xs text-red-700">{fieldErrors.guardianPhone.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Email</span>
              <input name="guardianEmail" type="email" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
              {fieldErrors?.guardianEmail ? (
                <span className="text-xs text-red-700">{fieldErrors.guardianEmail.join(" ")}</span>
              ) : null}
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Documents &amp; references</legend>
        <p className="text-sm text-stone-600">
          Record document details supplied at admission (certificate numbers, ID references, dates). File uploads are
          not stored here yet — use this as your checklist and reference log.
        </p>
        <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Birth certificate</span>
            <input
              name="documentBirthCert"
              placeholder="Registration number, issuing authority, or date issued"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.documentBirthCert ? (
              <span className="text-xs text-red-700">{fieldErrors.documentBirthCert.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">National ID / passport</span>
            <input
              name="documentNationalId"
              placeholder="Document number and type"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.documentNationalId ? (
              <span className="text-xs text-red-700">{fieldErrors.documentNationalId.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Transfer / leaving certificate</span>
            <input
              name="documentTransferCert"
              placeholder="Reference from previous school (if applicable)"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.documentTransferCert ? (
              <span className="text-xs text-red-700">{fieldErrors.documentTransferCert.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Medical / immunization</span>
            <textarea
              name="documentMedicalImmunization"
              rows={2}
              placeholder="Health card ref, immunization record summary, or clinic note"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.documentMedicalImmunization ? (
              <span className="text-xs text-red-700">{fieldErrors.documentMedicalImmunization.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Other documents</span>
            <textarea
              name="documentOtherNotes"
              rows={2}
              placeholder="Any other papers on file (e.g. custody order, sponsorship letter)"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.documentOtherNotes ? (
              <span className="text-xs text-red-700">{fieldErrors.documentOtherNotes.join(" ")}</span>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-0 p-0">
        <legend className="text-sm font-semibold text-stone-900">Education &amp; previous school</legend>
        <p className="text-sm text-stone-600">
          If the learner is transferring from another institution, capture the last school&apos;s details (typical
          admission transfer block).
        </p>

        <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600">Previous school information</h3>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">School name</span>
            <input
              name="previousSchool"
              placeholder="Full name of the last school or college"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.previousSchool ? (
              <span className="text-xs text-red-700">{fieldErrors.previousSchool.join(" ")}</span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">School address</span>
            <textarea
              name="previousSchoolAddress"
              rows={2}
              placeholder="Town, region, postcode / country if relevant"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.previousSchoolAddress ? (
              <span className="text-xs text-red-700">{fieldErrors.previousSchoolAddress.join(" ")}</span>
            ) : null}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Last class / grade / year</span>
              <input
                name="previousSchoolClassOrGrade"
                placeholder="e.g. Year 9, Grade 7, Form 3"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.previousSchoolClassOrGrade ? (
                <span className="text-xs text-red-700">{fieldErrors.previousSchoolClassOrGrade.join(" ")}</span>
              ) : null}
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-800">Date left school</span>
              <input
                name="previousSchoolDateLeft"
                type="date"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
              {fieldErrors?.previousSchoolDateLeft ? (
                <span className="text-xs text-red-700">{fieldErrors.previousSchoolDateLeft.join(" ")}</span>
              ) : null}
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-800">Reason for leaving / transfer</span>
            <textarea
              name="previousSchoolLeavingReason"
              rows={2}
              placeholder="e.g. Relocation, completion of phase, disciplinary transfer — as appropriate"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {fieldErrors?.previousSchoolLeavingReason ? (
              <span className="text-xs text-red-700">{fieldErrors.previousSchoolLeavingReason.join(" ")}</span>
            ) : null}
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-stone-800">General admission notes</span>
          <textarea
            name="admissionNotes"
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="Medical alerts, learning needs, or other notes not covered above."
          />
          {fieldErrors?.admissionNotes ? (
            <span className="text-xs text-red-700">{fieldErrors.admissionNotes.join(" ")}</span>
          ) : null}
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Submit admission"}
      </button>
    </form>
  );
}
