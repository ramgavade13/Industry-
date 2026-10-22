"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/projectTypes";
import type { TaskOptions, TaskRow } from "@/lib/taskTypes";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/taskStyles";

const inputClass =
  "w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink/90 mb-1.5">{label}</span>
      {children}
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

export default function TaskForm({
  action,
  options,
  task,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  options: TaskOptions;
  task?: TaskRow;
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
          <Field label="Task title *" error={err("task")}>
            <input name="task" required defaultValue={val("task", task?.task ?? "")} className={inputClass} />
          </Field>
        </div>

        <Field label="Assign to *" error={err("assignee")}>
          <select
            name="assignee"
            required
            defaultValue={val("assignee", task ? String(task.assignee) : "")}
            className={inputClass}
          >
            <option value="">Select an employee</option>
            {options.employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Project" error={err("project")}>
          <select
            name="project"
            defaultValue={val("project", task?.project_id ? String(task.project_id) : "")}
            className={inputClass}
          >
            <option value="">No project</option>
            {options.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Due date *" error={err("due_date")}>
          <input
            name="due_date"
            type="date"
            required
            defaultValue={val("due_date", task?.due_date ?? "")}
            className={inputClass}
          />
        </Field>

        <Field label="Priority" error={err("priority")}>
          <select name="priority" defaultValue={val("priority", task?.priority ?? "Medium")} className={inputClass}>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" error={err("status")}>
          <select name="status" defaultValue={val("status", task?.status ?? "Not Started")} className={inputClass}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
        <Link href="/tasks" className="text-sm font-semibold text-muted hover:text-ink transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
