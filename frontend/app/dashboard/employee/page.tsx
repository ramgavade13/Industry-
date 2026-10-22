import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import TaskStatusSelect from "@/components/TaskStatusSelect";
import { fetchEmployeeStats } from "@/lib/api";
import { fetchTasks } from "@/lib/tasksApi";
import { formatDate, priorityColor } from "@/lib/taskStyles";
import { setTaskStatus } from "@/app/tasks/actions";

// Maps priority labels to badge classes using design tokens
const priorityBadge: Record<string, string> = {
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low",
};

export default async function EmployeeDashboardPage() {
  const [myStats, myTasks] = await Promise.all([
    fetchEmployeeStats(),
    fetchTasks(),
  ]);

  return (
    <DashboardLayout role="employee" title="My Dashboard" subtitle="Your assigned tasks and deadlines">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {myStats.map((s) => <KPICard key={s.label} {...s} />)}
      </div>

      <div className="card rounded-xl mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">My Tasks</h3>
          <p className="text-xs text-muted mt-1">Change the status as you make progress.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                <th className="px-5 py-3 font-semibold">Task</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted">
                    You have no tasks assigned.
                  </td>
                </tr>
              )}
              {myTasks.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">
                    {t.task}
                    {t.project && <div className="text-xs text-muted font-normal">{t.project}</div>}
                  </td>
                  <td className="px-5 py-3 text-muted tabular-nums">{formatDate(t.due_date)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityBadge[t.priority] ?? (priorityColor[t.priority] ?? "bg-surface-subtle text-muted border-border")}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <TaskStatusSelect id={t.id} status={t.status} action={setTaskStatus} />
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
