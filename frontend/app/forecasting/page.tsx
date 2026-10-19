import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartWidget from "@/components/ChartWidget";
import { fetchForecastChart, fetchForecastSummary, fetchForecastNotes } from "@/lib/api";
import { fetchProjectForecast } from "@/lib/projectForecastApi";

const STATE_STYLES: Record<string, string> = {
  "On track": "text-[#5FB985] border-[#5FB985]/40",
  "At risk": "text-[#E0A93B] border-[#E0A93B]/40",
  Delayed: "text-[#D65F5F] border-[#D65F5F]/40",
  Completed: "text-[#8B93A7] border-[#8B93A7]/40",
};
const DEFAULT_STATE_STYLE = "text-[#8B93A7] border-[#242B3D]";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function lateness(days: number | null) {
  if (days === null) return "—";
  if (days === 0) return "On the date";
  return days > 0 ? `${days} days late` : `${Math.abs(days)} days early`;
}

export default async function ForecastingPage() {
  const [chartData, summary, notes, projectForecast] = await Promise.all([
    fetchForecastChart(),
    fetchForecastSummary(),
    fetchForecastNotes(),
    fetchProjectForecast(),
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
            subtitle="Actuals vs projected, next 3 months (₹ in lakhs)"
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

      {projectForecast && (
        <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5 mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#E7E4DC]">Project Progress Forecast</h3>
              <p className="text-xs text-[#8B93A7] mt-1 leading-5">
                Each project&apos;s progress so far is used to estimate when it will reach 100%,
                assuming the same pace continues.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {["On track", "At risk", "Delayed", "Completed"].map((s) => (
                <span key={s} className={`rounded-full border px-3 py-1 ${STATE_STYLES[s]}`}>
                  {projectForecast.summary[s] ?? 0} {s}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
                  <th className="py-2 pr-4 font-medium">Project</th>
                  <th className="py-2 pr-4 font-medium">Progress</th>
                  <th className="py-2 pr-4 font-medium">Planned end</th>
                  <th className="py-2 pr-4 font-medium">Projected finish</th>
                  <th className="py-2 pr-4 font-medium">Difference</th>
                  <th className="py-2 pr-4 font-medium">At deadline</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectForecast.projects.map((p) => (
                  <tr key={p.id} className="border-b border-[#242B3D]/60 last:border-0 align-top" title={p.note}>
                    <td className="py-3 pr-4">
                      <div className="text-[#E7E4DC]">{p.name}</div>
                      {p.team && <div className="text-xs text-[#5C6580]">{p.team}</div>}
                    </td>
                    <td className="py-3 pr-4 min-w-28">
                      <div className="h-1.5 rounded-full bg-[#0F1420] overflow-hidden">
                        <div className="h-full bg-[#C9A227]" style={{ width: `${p.progress}%` }} />
                      </div>
                      <div className="text-xs text-[#8B93A7] mt-1">{p.progress}%</div>
                    </td>
                    <td className="py-3 pr-4 text-[#8B93A7] whitespace-nowrap">{formatDate(p.end_date)}</td>
                    <td className="py-3 pr-4 text-[#E7E4DC] whitespace-nowrap">{formatDate(p.projected_finish)}</td>
                    <td className="py-3 pr-4 text-[#8B93A7] whitespace-nowrap">{lateness(p.days_late)}</td>
                    <td className="py-3 pr-4 text-[#8B93A7]">
                      {p.progress_at_deadline === null ? "—" : `${p.progress_at_deadline}%`}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap ${STATE_STYLES[p.state] ?? DEFAULT_STATE_STYLE}`}>
                        {p.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#5C6580] mt-4">
            A project up to a week behind is &ldquo;At risk&rdquo;; more than a week behind is &ldquo;Delayed&rdquo;.
            Hover over a row for the reason.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}