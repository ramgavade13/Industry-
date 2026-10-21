"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState, ProjectDetail } from "@/lib/projectTypes";

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
];

const inputClass =
  "w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink/90 mb-1.5">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-muted mt-1.5">{hint}</span>}
      {error && (
        <span className="block text-xs font-semibold text-danger mt-1.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </span>
      )}
    </label>
  );
}

export default function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  project?: ProjectDetail;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);

  // After a failed save the typed values come back, so nothing the user typed is lost.
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
        <div className="sm:col-span-2">
          <Field label="Project name *" error={err("name")}>
            <input name="name" required defaultValue={val("name", project?.name ?? "")} className={inputClass} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Description" error={err("description")}>
            <textarea
              name="description"
              rows={3}
              defaultValue={val("description", project?.description ?? "")}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Status" error={err("status")}>
          <select name="status" defaultValue={val("status", project?.status ?? "planning")} className={inputClass}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Progress (%)" error={err("progress")} hint="0 to 100">
          <input
            name="progress"
            type="number"
            min={0}
            max={100}
            defaultValue={val("progress", String(project?.progress ?? 0))}
            className={inputClass}
          />
        </Field>

        <Field label="Team" error={err("team")}>
          <input name="team" defaultValue={val("team", project?.team ?? "")} className={inputClass} />
        </Field>

        <Field label="Team size" error={err("team_size")}>
          <input
            name="team_size"
            type="number"
            min={0}
            defaultValue={val("team_size", String(project?.team_size ?? 0))}
            className={inputClass}
          />
        </Field>

        <Field label="Budget (₹)" error={err("budget")}>
          <input
            name="budget"
            type="number"
            min={0}
            step="0.01"
            defaultValue={val("budget", String(project?.budget ?? 0))}
            className={inputClass}
          />
        </Field>

        <Field label="Spent so far (₹)" error={err("spent")}>
          <input
            name="spent"
            type="number"
            min={0}
            step="0.01"
            defaultValue={val("spent", String(project?.spent ?? 0))}
            className={inputClass}
          />
        </Field>

        <Field label="Start date" error={err("start_date")}>
          <input
            name="start_date"
            type="date"
            defaultValue={val("start_date", project?.start_date ?? "")}
            className={inputClass}
          />
        </Field>

        <Field label="End date" error={err("end_date")}>
          <input
            name="end_date"
            type="date"
            defaultValue={val("end_date", project?.end_date ?? "")}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex items-center gap-4 mt-8 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="btn-brand rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/projects" className="text-sm font-semibold text-muted hover:text-ink transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
