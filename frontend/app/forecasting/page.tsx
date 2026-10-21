import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartWidget from "@/components/ChartWidget";
import { fetchForecastChart, fetchForecastSummary, fetchForecastNotes } from "@/lib/api";
import { fetchProjectForecast } from "@/lib/projectForecastApi";

// Maps forecast state to badge utility classes from globals.css
const STATE_BADGE: Record<string, string> = {
  "On track": "badge-low",
  "At risk": "badge-medium",
  Delayed: "badge-high",
  Completed: "bg-surface-subtle text-muted border border-border",
};

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
              { key: "actual", label: "Actual", color: "var(--color-muted)" },
              { key: "forecast", label: "Forecast", color: "var(--color-brand)" },
            ]}
          />
        </div>

        <div className="card rounded-xl px-5 py-5">
          <h3 className="text-sm font-semibold text-ink mb-4">What the model is seeing</h3>
          <div className="space-y-4">
            {notes.map((n) => (
              <div key={n.title} className="border-l-2 border-brand/40 pl-3">
                <div className="text-sm font-medium text-ink">{n.title}</div>
                <p className="text-xs text-muted mt-1 leading-5">{n.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {projectForecast && (
        <div className="card rounded-xl px-5 py-5 mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">Project Progress Forecast</h3>
              <p className="text-xs text-muted mt-1 leading-5">
                Each project&apos;s progress so far is used to estimate when it will reach 100%,
                assuming the same pace continues.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {["On track", "At risk", "Delayed", "Completed"].map((s) => (
                <span key={s} className={`inline-flex items-center px-2.5 py-1 rounded-full font-semibold border ${STATE_BADGE[s] ?? "bg-surface-subtle text-muted border-border"}`}>
                  {projectForecast.summary[s] ?? 0} {s}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                  <th className="py-2 pr-4 font-semibold">Project</th>
                  <th className="py-2 pr-4 font-semibold">Progress</th>
                  <th className="py-2 pr-4 font-semibold">Planned end</th>
                  <th className="py-2 pr-4 font-semibold">Projected finish</th>
                  <th className="py-2 pr-4 font-semibold">Difference</th>
                  <th className="py-2 pr-4 font-semibold">At deadline</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectForecast.projects.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 align-top hover:bg-surface-subtle transition-colors" title={p.note}>
                    <td className="py-3 pr-4">
                      <div className="text-ink font-medium">{p.name}</div>
                      {p.team && <div className="text-xs text-muted font-normal">{p.team}</div>}
                    </td>
                    <td className="py-3 pr-4 min-w-28">
                      <div className="h-1.5 rounded-full bg-surface-subtle border border-border overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <div className="text-xs text-muted mt-1 tabular-nums">{p.progress}%</div>
                    </td>
                    <td className="py-3 pr-4 text-muted whitespace-nowrap tabular-nums">{formatDate(p.end_date)}</td>
                    <td className="py-3 pr-4 text-ink whitespace-nowrap tabular-nums">{formatDate(p.projected_finish)}</td>
                    <td className="py-3 pr-4 text-muted whitespace-nowrap tabular-nums">{lateness(p.days_late)}</td>
                    <td className="py-3 pr-4 text-muted tabular-nums">
                      {p.progress_at_deadline === null ? "—" : `${p.progress_at_deadline}%`}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${STATE_BADGE[p.state] ?? "bg-surface-subtle text-muted border-border"}`}>
                        {p.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted/70 mt-4">
            A project up to a week behind is &ldquo;At risk&rdquo;; more than a week behind is &ldquo;Delayed&rdquo;.
            Hover over a row for the reason.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
