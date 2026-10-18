import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { fetchRiskDetails } from "@/lib/api";

const badge: Record<string, string> = {
  high: "bg-[#D65F5F]/15 text-[#D65F5F] border-[#D65F5F]/40",
  medium: "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/40",
  low: "bg-[#3FA77C]/15 text-[#3FA77C] border-[#3FA77C]/40",
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

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D]">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">Projects needing attention</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Budget used</th>
              <th className="px-5 py-3 font-medium">Why</th>
            </tr>
          </thead>
          <tbody>
            {risks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-[#8B93A7]">
                  No risky projects right now. Run the AI analysis to refresh.
                </td>
              </tr>
            )}
            {risks.map((r) => (
              <tr key={r.project} className="border-b border-[#242B3D] last:border-0 align-top">
                <td className="px-5 py-3 text-[#E7E4DC]">{r.project}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded border px-2 py-0.5 text-xs uppercase ${
                      badge[r.severity] ?? badge.low
                    }`}
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#E7E4DC]">{r.score ?? "-"}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{pct(r.progress)}</td>
                <td
                  className={`px-5 py-3 ${
                    r.budget_used_pct !== null && r.budget_used_pct > 100
                      ? "text-[#D65F5F]"
                      : "text-[#8B93A7]"
                  }`}
                >
                  {pct(r.budget_used_pct)}
                </td>
                <td className="px-5 py-3 text-[#8B93A7]">{r.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}