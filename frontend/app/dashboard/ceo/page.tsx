import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartWidget from "@/components/ChartWidget";
import { fetchKPIs, fetchRevenueTrend, fetchRiskAlerts } from "@/lib/api";

const severityColor: Record<string, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};

export default async function CeoDashboardPage() {
  const [kpis, revenue, risks] = await Promise.all([
    fetchKPIs(), fetchRevenueTrend(), fetchRiskAlerts(),
  ]);

  return (
    <DashboardLayout role="ceo" title="CEO Dashboard" subtitle="Company performance at a glance">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ChartWidget
            title="Revenue vs Expenses" subtitle="Last 6 months, ₹ in lakhs"
            type="line" data={revenue} xKey="month"
            series={[
              { key: "revenue", label: "Revenue", color: "var(--color-brand)" },
              { key: "expenses", label: "Expenses", color: "var(--color-muted)" },
            ]}
          />
        </div>

        <div className="card rounded-xl px-5 py-5">
          <h3 className="text-sm font-semibold text-ink mb-4">Risk Alerts</h3>
          <div className="space-y-3">
            {risks.map((r) => (
              <div key={r.project} className="border border-border rounded-lg px-3 py-3">
                <div className="text-sm text-ink">{r.project}</div>
                <div className="text-xs text-muted mt-1">{r.risk}</div>
                <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded border ${severityColor[r.severity] ?? "badge-low"}`}>
                  {r.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
