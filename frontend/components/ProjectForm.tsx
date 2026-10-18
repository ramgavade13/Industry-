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
  "w-full bg-[#0F1420] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] placeholder:text-[#5C6580]";

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
      <span className="block text-xs text-[#8B93A7] mb-1">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-[#5C6580] mt-1">{hint}</span>}
      {error && <span className="block text-xs text-[#D65F5F] mt-1">{error}</span>}
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
    <form action={formAction} className="bg-[#161C2C] border border-[#242B3D] rounded-lg p-6 max-w-3xl">
      {state?.error && (
        <div className="mb-5 rounded-md border border-[#D65F5F]/40 bg-[#D65F5F]/10 px-4 py-3 text-sm text-[#D65F5F]">
          {state.error}
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

      <div className="flex items-center gap-4 mt-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#C9A227] text-[#0F1420] rounded-md px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/projects" className="text-sm text-[#8B93A7] hover:text-[#E7E4DC]">
          Cancel
        </Link>
      </div>
    </form>
  );
}