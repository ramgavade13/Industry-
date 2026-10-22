import DashboardLayout from "@/components/DashboardLayout";
import ChartWidget from "@/components/ChartWidget";
import { fetchProductivity, fetchWorkload } from "@/lib/api";

// Maps workload status to badge classes using design tokens
const statusBadge: Record<string, string> = {
  "On track": "badge-low",
  "At risk": "badge-medium",
  "Not started": "bg-surface-subtle text-muted border border-border",
};

export default async function ProductivityPage() {
  const [productivity, workload] = await Promise.all([fetchProductivity(), fetchWorkload()]);

  return (
    <DashboardLayout role="ceo" title="Team Productivity Analysis" subtitle="Task completion and workload across teams">
      <ChartWidget
        title="Task Completion Rate by Team" subtitle="% of assigned tasks, this sprint"
        type="bar" data={productivity} xKey="team"
        series={[
          { key: "completed", label: "Completed", color: "var(--color-brand)" },
          { key: "pending", label: "Pending", color: "var(--color-border-hover)" },
        ]}
      />

      <div className="card rounded-xl mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">Workload &amp; Deadlines</h3>
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
              {workload.map((w) => (
                <tr key={w.task} className="border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">{w.member}</td>
                  <td className="px-5 py-3 text-muted">{w.task}</td>
                  <td className="px-5 py-3 text-muted tabular-nums">{w.due}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge[w.status] ?? "bg-surface-subtle text-muted border-border"}`}>
                      {w.status}
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
