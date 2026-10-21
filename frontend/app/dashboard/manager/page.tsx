import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { fetchManagerOverview, fetchManagerTasks } from "@/lib/api";

// Maps task status to badge classes using design tokens
const statusBadge: Record<string, string> = {
  Completed: "badge-low",
  "In Progress": "bg-secondary-subtle text-secondary border border-secondary-border",
  "Not Started": "bg-surface-subtle text-muted border border-border",
  Delayed: "badge-high",
  // older status names (still used by the sample data)
  "On track": "badge-low",
  "At risk": "badge-medium",
  "Not started": "bg-surface-subtle text-muted border border-border",
};

export default async function ManagerDashboardPage() {
  const [teamOverview, teamTasks] = await Promise.all([
    fetchManagerOverview(),
    fetchManagerTasks(),
  ]);

  return (
    <DashboardLayout role="manager" title="Manager Dashboard" subtitle="Your team's progress this sprint">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamOverview.map((s) => <KPICard key={s.label} {...s} />)}
      </div>

      <div className="card rounded-xl mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">Team Tasks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Task</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {teamTasks.map((t) => (
                <tr key={t.task} className="border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">{t.member}</td>
                  <td className="px-5 py-3 text-muted">{t.task}</td>
                  <td className="px-5 py-3 text-muted tabular-nums">{t.due}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge[t.status] ?? "bg-surface-subtle text-muted border border-border"}`}>
                      {t.status}
                    </span>
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
