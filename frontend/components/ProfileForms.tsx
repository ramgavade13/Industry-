"use client";

import { useActionState } from "react";
import { Field, inputClass } from "./FormField";
import { changePassword, updateProfile } from "@/app/profile/actions";
import type { ManagedUser, SaveState } from "@/lib/userTypes";

function Notice({ state, ok }: { state: SaveState; ok: string }) {
  if (state?.saved) {
    return (
      <div className="mb-6 rounded-xl border border-success-border bg-success-subtle px-4 py-3 text-sm font-semibold text-success flex items-center gap-2 shadow-sm">
        <svg className="w-4 h-4 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        <span>{ok}</span>
      </div>
    );
  }
  if (state?.error) {
    return (
      <div className="mb-6 rounded-xl border border-danger-border bg-danger-subtle px-4 py-3 text-sm font-semibold text-danger flex items-center gap-2 shadow-sm">
        <svg className="w-4 h-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>{state.error}</span>
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
    <form action={formAction} className="card rounded-2xl p-6 sm:p-8 bg-surface border border-border shadow-card">
      <h3 className="text-lg font-bold font-display text-ink mb-5 pb-3 border-b border-border/70">Your details</h3>
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
        className="btn-brand mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
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
    <form action={formAction} className="card rounded-2xl p-6 sm:p-8 bg-surface border border-border shadow-card">
      <h3 className="text-lg font-bold font-display text-ink mb-5 pb-3 border-b border-border/70">Change password</h3>
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
        className="btn-brand mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
      >
        {pending ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
