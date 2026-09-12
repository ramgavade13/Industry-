import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartWidget from "@/components/ChartWidget";
import { fetchKPIs, fetchRevenueTrend, fetchRiskAlerts } from "@/lib/api";

const severityColor = {
  high: "bg-[#D65F5F]/15 text-[#D65F5F] border-[#D65F5F]/30",
  medium: "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30",
  low: "bg-[#3FA77C]/15 text-[#3FA77C] border-[#3FA77C]/30",
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
              { key: "revenue", label: "Revenue", color: "#C9A227" },
              { key: "expenses", label: "Expenses", color: "#8B93A7" },
            ]}
          />
        </div>

        <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5">
          <h3 className="text-sm font-semibold text-[#E7E4DC] mb-4">Risk Alerts</h3>
          <div className="space-y-3">
            {risks.map((r) => (
              <div key={r.project} className="border border-[#242B3D] rounded-md px-3 py-3">
                <div className="text-sm text-[#E7E4DC]">{r.project}</div>
                <div className="text-xs text-[#8B93A7] mt-1">{r.risk}</div>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded border ${severityColor[r.severity]}`}>
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
