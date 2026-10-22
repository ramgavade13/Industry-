import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import { fetchTaskOptions, fetchTasks } from "@/lib/tasksApi";
import { STATUS_OPTIONS, formatDate } from "@/lib/taskStyles";
import { deleteTask } from "./actions";

const MESSAGES: Record<string, { text: string; good: boolean }> = {
  created: { text: "Task created.", good: true },
  updated: { text: "Task updated.", good: true },
  deleted: { text: "Task deleted.", good: true },
  denied: { text: "You are not allowed to delete this task.", good: false },
};

// Local badge maps — do not change lib/taskStyles
const priorityBadge: Record<string, string> = {
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low",
};

const statusBadge: Record<string, string> = {
  Completed: "badge-low",
  "In Progress": "bg-secondary-subtle text-secondary border border-secondary-border",
  "Not Started": "bg-surface-subtle text-muted border border-border",
  Delayed: "badge-high",
};

const filterInputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; project?: string; msg?: string }>;
}) {
  const { q = "", status = "", project = "", msg = "" } = await searchParams;
  const [tasks, options] = await Promise.all([
    fetchTasks({ q, status, project }),
    fetchTaskOptions(),
  ]);
  const banner = MESSAGES[msg];

  return (
    <DashboardLayout role="ceo" title="Tasks" subtitle="Create, assign and track your team's tasks">
      {banner && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm font-medium ${
            banner.good
              ? "border-success-border bg-success-subtle text-success"
              : "border-danger-border bg-danger-subtle text-danger"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by task or person"
            className={`${filterInputClass} w-full sm:w-64`}
          />
          <select
            name="status"
            defaultValue={status}
            className={filterInputClass}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="project"
            defaultValue={project}
            className={`${filterInputClass} max-w-56`}
          >
            <option value="">All projects</option>
            {options.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-border bg-surface-subtle px-4 py-2 text-sm font-medium text-ink hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            Apply
          </button>
          {(q || status || project) && (
            <Link href="/tasks" className="px-2 py-2 text-sm text-muted hover:text-ink transition-colors">
              Clear
            </Link>
          )}
        </form>

        <Link
          href="/tasks/new"
          className="btn-brand text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-1"
        >
          + Add task
        </Link>
      </div>

      <div className="card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-ink">All tasks</h3>
          <span className="text-xs text-muted">{tasks.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                <th className="px-5 py-3 font-semibold">Task</th>
                <th className="px-5 py-3 font-semibold">Assigned to</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No tasks match your search.
                  </td>
                </tr>
              )}
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">
                    {t.task}
                    {t.project && <div className="text-xs text-muted font-normal">{t.project}</div>}
                  </td>
                  <td className="px-5 py-3 text-muted">{t.member}</td>
                  <td className="px-5 py-3 text-muted tabular-nums">{formatDate(t.due_date)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityBadge[t.priority] ?? "bg-surface-subtle text-muted border-border"}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge[t.status] ?? "bg-surface-subtle text-muted border border-border"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/tasks/${t.id}/edit`}
                        className="text-xs font-semibold text-brand hover:text-brand-hover hover:underline focus:outline-none focus:ring-2 focus:ring-brand/30 rounded transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteTaskButton action={deleteTask.bind(null, t.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
