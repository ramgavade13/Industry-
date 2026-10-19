"use client";

import { useActionState } from "react";
import { Field, inputClass } from "./FormField";
import { changePassword, updateProfile } from "@/app/profile/actions";
import type { ManagedUser, SaveState } from "@/lib/userTypes";

function Notice({ state, ok }: { state: SaveState; ok: string }) {
  if (state?.saved) {
    return (
      <div className="mb-5 rounded-md border border-[#3FA77C]/40 bg-[#3FA77C]/10 px-4 py-3 text-sm text-[#3FA77C]">
        {ok}
      </div>
    );
  }
  if (state?.error) {
    return (
      <div className="mb-5 rounded-md border border-[#D65F5F]/40 bg-[#D65F5F]/10 px-4 py-3 text-sm text-[#D65F5F]">
        {state.error}
      </div>
    );
  }
  return null;
}

export function ProfileForm({ profile }: { profile: ManagedUser }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(updateProfile, null);
  const val = (key: string, fallback: string) => state?.values?.[key] ?? fallback;
  const err = (key: string) => state?.fieldErrors?.[key];

  return (
    <form action={formAction} className="bg-[#161C2C] border border-[#242B3D] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-[#E7E4DC] mb-4">Your details</h3>
      <Notice state={state} ok="Profile saved." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First name" error={err("first_name")}>
          <input name="first_name" defaultValue={val("first_name", profile.first_name)} className={inputClass} />
        </Field>
        <Field label="Last name" error={err("last_name")}>
          <input name="last_name" defaultValue={val("last_name", profile.last_name)} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Email" error={err("email")}>
            <input name="email" type="email" required defaultValue={val("email", profile.email)} className={inputClass} />
          </Field>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-6 bg-[#C9A227] text-[#0F1420] rounded-md px-5 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save details"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(changePassword, null);
  const err = (key: string) => state?.fieldErrors?.[key];

  return (
    <form action={formAction} className="bg-[#161C2C] border border-[#242B3D] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-[#E7E4DC] mb-4">Change password</h3>
      <Notice state={state} ok="Password changed." />
      <div className="space-y-5">
        <Field label="Current password" error={err("current_password")}>
          <input name="current_password" type="password" required autoComplete="current-password" className={inputClass} />
        </Field>
        <Field label="New password" error={err("new_password")} hint="At least 8 characters, not too common">
          <input name="new_password" type="password" required autoComplete="new-password" className={inputClass} />
        </Field>
        <Field label="Confirm new password" error={err("confirm_password")}>
          <input name="confirm_password" type="password" required autoComplete="new-password" className={inputClass} />
        </Field>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-6 bg-[#C9A227] text-[#0F1420] rounded-md px-5 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}