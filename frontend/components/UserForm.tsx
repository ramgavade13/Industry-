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
    <form action={formAction} className="bg-[#161C2C] border border-[#242B3D] rounded-lg p-6 max-w-3xl">
      {state?.error && (
        <div className="mb-5 rounded-md border border-[#D65F5F]/40 bg-[#D65F5F]/10 px-4 py-3 text-sm text-[#D65F5F]">
          {state.error}
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
            className={`${inputClass} ${editing ? "opacity-60" : ""}`}
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
          <label className="flex items-center gap-2 text-sm text-[#E7E4DC] sm:col-span-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={val("is_active", user?.is_active ? "on" : "off") === "on"}
            />
            Account is active (untick to deactivate this user)
          </label>
        )}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#C9A227] text-[#0F1420] rounded-md px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/dashboard/admin" className="text-sm text-[#8B93A7] hover:text-[#E7E4DC]">
          Cancel
        </Link>
      </div>
    </form>
  );
}