"use client";

import { useTransition } from "react";
import { STATUS_OPTIONS } from "@/lib/taskStyles";

const statusBadgeStyles: Record<string, string> = {
  Completed: "bg-success-subtle text-success border-success-border",
  "In Progress": "bg-secondary-subtle text-secondary border-secondary/30",
  "Not Started": "bg-slate-100 text-slate-700 border-slate-300",
  Delayed: "bg-danger-subtle text-danger border-danger-border",
};

export default function TaskStatusSelect({
  id,
  status,
  action,
}: {
  id: number;
  status: string;
  action: (id: number, status: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      key={status}
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => action(id, next));
      }}
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-sm outline-none transition-all focus:ring-2 focus:ring-brand/20 disabled:opacity-60 cursor-pointer ${
        statusBadgeStyles[status] ?? "bg-surface text-ink border-border"
      }`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s} className="bg-white text-slate-900">
          {s}
        </option>
      ))}
    </select>
  );
}
