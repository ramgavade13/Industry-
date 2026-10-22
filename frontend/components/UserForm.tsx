"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, inputClass } from "./FormField";
import { ROLE_OPTIONS, type ManagedUser, type SaveState } from "@/lib/userTypes";

export default function UserForm({
  action,
  user,
  submitLabel,
}: {
  action: (state: SaveState, formData: FormData) => Promise<SaveState>;
  user?: ManagedUser;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(action, null);
  const editing = Boolean(user);

  // After a failed save the typed values come back, so nothing the admin typed is lost.
  const val = (key: string, fallback: string) => state?.values?.[key] ?? fallback;
  const err = (key: string) => state?.fieldErrors?.[key];

  return (
    <form action={formAction} className="card rounded-2xl p-6 sm:p-8 bg-surface border border-border shadow-card max-w-3xl">
      {state?.error && (
        <div className="mb-6 rounded-xl border border-danger-border bg-danger-subtle px-4 py-3 text-sm font-semibold text-danger flex items-center gap-2 shadow-sm">
          <svg className="w-4 h-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First name *" error={err("first_name")}>
          <input name="first_name" required defaultValue={val("first_name", user?.first_name ?? "")} className={inputClass} />
        </Field>

        <Field label="Last name" error={err("last_name")}>
          <input name="last_name" defaultValue={val("last_name", user?.last_name ?? "")} className={inputClass} />
        </Field>

        <Field label="Username *" error={err("username")} hint={editing ? "The username cannot be changed" : undefined}>
          <input
            name="username"
            required
            readOnly={editing}
            defaultValue={val("username", user?.username ?? "")}
            className={`${inputClass} ${editing ? "bg-surface-subtle text-muted cursor-not-allowed" : ""}`}
          />
        </Field>

        <Field label="Email *" error={err("email")}>
          <input name="email" type="email" required defaultValue={val("email", user?.email ?? "")} className={inputClass} />
        </Field>

        <Field label="Role" error={err("role")}>
          <select name="role" defaultValue={val("role", user?.role ?? "employee")} className={inputClass}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={editing ? "Reset password (optional)" : "Password *"}
          error={err("password")}
          hint={editing ? "Leave empty to keep the current password" : "At least 8 characters, not too common"}
        >
          <input
            name="password"
            type="password"
            required={!editing}
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>

        {editing && (
          <label className="flex items-center gap-2.5 text-sm font-semibold text-ink sm:col-span-2 pt-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={val("is_active", user?.is_active ? "on" : "off") === "on"}
              className="w-4 h-4 rounded text-brand focus:ring-brand border-border"
            />
            <span>Account is active (untick to deactivate this user)</span>
          </label>
        )}
      </div>

      <div className="flex items-center gap-4 mt-8 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="btn-brand rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/dashboard/admin" className="text-sm font-semibold text-muted hover:text-ink transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
