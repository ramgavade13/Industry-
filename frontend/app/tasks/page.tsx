import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import { fetchTaskOptions, fetchTasks } from "@/lib/tasksApi";
import { STATUS_OPTIONS, formatDate, priorityColor, statusColor } from "@/lib/taskStyles";
import { deleteTask } from "./actions";

const MESSAGES: Record<string, { text: string; good: boolean }> = {
  created: { text: "Task created.", good: true },
  updated: { text: "Task updated.", good: true },
  deleted: { text: "Task deleted.", good: true },
  denied: { text: "You are not allowed to delete this task.", good: false },
};

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
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            banner.good
              ? "border-[#3FA77C]/40 bg-[#3FA77C]/10 text-[#3FA77C]"
              : "border-[#D65F5F]/40 bg-[#D65F5F]/10 text-[#D65F5F]"
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
            className="bg-[#161C2C] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] placeholder:text-[#5C6580] w-64"
          />
          <select
            name="status"
            defaultValue={status}
            className="bg-[#161C2C] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC]"
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
            className="bg-[#161C2C] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] max-w-56"
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
            className="bg-[#242B3D] text-[#E7E4DC] rounded-md px-4 py-2 text-sm font-medium"
          >
            Apply
          </button>
          {(q || status || project) && (
            <Link href="/tasks" className="px-2 py-2 text-sm text-[#8B93A7] hover:text-[#E7E4DC]">
              Clear
            </Link>
          )}
        </form>

        <Link
          href="/tasks/new"
          className="bg-[#C9A227] text-[#0F1420] rounded-md px-4 py-2 text-sm font-medium"
        >
          + Add task
        </Link>
      </div>

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D] flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">All tasks</h3>
          <span className="text-xs text-[#8B93A7]">{tasks.length} shown</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Assigned to</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-[#8B93A7]">
                  No tasks match your search.
                </td>
              </tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-[#242B3D] last:border-0">
                <td className="px-5 py-3 text-[#E7E4DC]">
                  {t.task}
                  {t.project && <div className="text-xs text-[#5C6580]">{t.project}</div>}
                </td>
                <td className="px-5 py-3 text-[#8B93A7]">{t.member}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{formatDate(t.due_date)}</td>
                <td className={`px-5 py-3 ${priorityColor[t.priority] ?? "text-[#8B93A7]"}`}>{t.priority}</td>
                <td className={`px-5 py-3 font-medium ${statusColor[t.status] ?? "text-[#8B93A7]"}`}>{t.status}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/tasks/${t.id}/edit`}
                      className="text-xs text-[#C9A227] hover:text-[#E7E4DC] transition-colors"
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
    </DashboardLayout>
  );
}