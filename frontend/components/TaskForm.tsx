"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/projectTypes";
import type { TaskOptions, TaskRow } from "@/lib/taskTypes";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/taskStyles";

const inputClass =
  "w-full bg-[#0F1420] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] placeholder:text-[#5C6580]";

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
      <span className="block text-xs text-[#8B93A7] mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-[#D65F5F] mt-1">{error}</span>}
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
    <form action={formAction} className="bg-[#161C2C] border border-[#242B3D] rounded-lg p-6 max-w-3xl">
      {state?.error && (
        <div className="mb-5 rounded-md border border-[#D65F5F]/40 bg-[#D65F5F]/10 px-4 py-3 text-sm text-[#D65F5F]">
          {state.error}
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

      <div className="flex items-center gap-4 mt-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#C9A227] text-[#0F1420] rounded-md px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/tasks" className="text-sm text-[#8B93A7] hover:text-[#E7E4DC]">
          Cancel
        </Link>
      </div>
    </form>
  );
}