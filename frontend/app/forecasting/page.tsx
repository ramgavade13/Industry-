import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartWidget from "@/components/ChartWidget";
import { fetchForecastChart, fetchForecastSummary, fetchForecastNotes } from "@/lib/api";

export default async function ForecastingPage() {
  const [chartData, summary, notes] = await Promise.all([
    fetchForecastChart(),
    fetchForecastSummary(),
    fetchForecastNotes(),
  ]);

  return (
    <DashboardLayout role="ceo" title="Forecasting" subtitle="Projected revenue, expenses, and business trends">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => <KPICard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ChartWidget
            title="Revenue Forecast"
            subtitle="Actuals vs projected, next 5 months (₹ in lakhs)"
            type="line"
            data={chartData as unknown as Record<string, string | number>[]}
            xKey="month"
            series={[
              { key: "actual", label: "Actual", color: "#8B93A7" },
              { key: "forecast", label: "Forecast", color: "#C9A227" },
            ]}
          />
        </div>

        <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5">
          <h3 className="text-sm font-semibold text-[#E7E4DC] mb-4">What the model is seeing</h3>
          <div className="space-y-4">
            {notes.map((n) => (
              <div key={n.title} className="border-l-2 border-[#C9A227]/40 pl-3">
                <div className="text-sm text-[#E7E4DC]">{n.title}</div>
                <p className="text-xs text-[#8B93A7] mt-1 leading-5">{n.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}