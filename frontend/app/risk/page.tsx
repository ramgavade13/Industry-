import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { fetchRiskDetails } from "@/lib/api";

// Maps severity to badge utility classes from globals.css
const badge: Record<string, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};

function pct(value: number | null) {
  return value === null || value === undefined ? "-" : `${value}%`;
}

export default async function RiskPage() {
  const risks = await fetchRiskDetails();
  const high = risks.filter((r) => r.severity === "high").length;
  const medium = risks.filter((r) => r.severity === "medium").length;
  const top = risks[0];

  return (
    <DashboardLayout
      role="ceo"
      title="Risk Monitoring"
      subtitle="Projects flagged by the AI risk model, highest score first"
    >
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="High risk projects" value={String(high)} change="" trend="down" />
        <KPICard label="Medium risk projects" value={String(medium)} change="" trend="down" />
        <KPICard
          label="Highest risk score"
          value={top && top.score !== null ? String(top.score) : "-"}
          change=""
          trend="down"
        />
      </div>

      <div className="card rounded-xl mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">Projects needing attention</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Risk</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Progress</th>
                <th className="px-5 py-3 font-semibold">Budget used</th>
                <th className="px-5 py-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              {risks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No risky projects right now. Run the AI analysis to refresh.
                  </td>
                </tr>
              )}
              {risks.map((r) => (
                <tr key={r.project} className="border-b border-border last:border-0 align-top hover:bg-surface-subtle transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">{r.project}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        badge[r.severity] ?? badge.low
                      }`}
                    >
                      {r.severity.charAt(0).toUpperCase() + r.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink font-semibold tabular-nums">{r.score ?? "-"}</td>
                  <td className="px-5 py-3 text-muted tabular-nums">{pct(r.progress)}</td>
                  <td
                    className={`px-5 py-3 tabular-nums font-medium ${
                      r.budget_used_pct !== null && r.budget_used_pct > 100
                        ? "text-danger"
                        : "text-muted"
                    }`}
                  >
                    {pct(r.budget_used_pct)}
                  </td>
                  <td className="px-5 py-3 text-muted">{r.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
