"use client";

import { useTransition } from "react";
import { STATUS_OPTIONS, statusColor } from "@/lib/taskStyles";

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
      className={`bg-[#0F1420] border border-[#242B3D] rounded-md px-2 py-1 text-sm font-medium disabled:opacity-60 ${
        statusColor[status] ?? "text-[#8B93A7]"
      }`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}