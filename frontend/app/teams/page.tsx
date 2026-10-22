import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchTeams } from "@/lib/usersApi";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const allTeams = await fetchTeams();

  const needle = q.trim().toLowerCase();
  const teams = needle
    ? allTeams.filter(
        (t) =>
          t.team.toLowerCase().includes(needle) ||
          t.projects.some((p) => p.toLowerCase().includes(needle)) ||
          t.members.some((m) => m.name.toLowerCase().includes(needle))
      )
    : allTeams;

  return (
    <DashboardLayout role="ceo" title="Teams" subtitle="Who works on what, and how each team is progressing">
      <form method="get" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by team, project or person"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all w-full sm:w-72"
        />
        <button
          type="submit"
          className="rounded-lg border border-border bg-surface-subtle px-4 py-2 text-sm font-medium text-ink hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          Apply
        </button>
        {q && (
          <Link href="/teams" className="px-2 py-2 text-sm text-muted hover:text-ink transition-colors">
            Clear
          </Link>
        )}
      </form>

      {teams.length === 0 && (
        <div className="card rounded-xl px-5 py-8 text-center text-sm text-muted">
          No teams match your search.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {teams.map((t) => (
          <div key={t.team} className="card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-ink">{t.team}</h3>
                <span className="text-xs text-muted">
                  {t.project_count} project{t.project_count !== 1 ? "s" : ""} · {t.member_count} member
                  {t.member_count !== 1 ? "s" : ""}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-surface-subtle border border-border overflow-hidden mt-3">
                <div className="h-2 bg-brand rounded-full" style={{ width: `${t.completion_rate}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted mt-1 tabular-nums">
                <span>
                  {t.tasks_completed} of {t.tasks_total} tasks completed ({t.completion_rate}%)
                </span>
                <span className={t.tasks_delayed ? "text-danger font-semibold" : ""}>
                  {t.tasks_delayed} delayed
                </span>
              </div>
              {t.projects.length > 0 && (
                <div className="text-xs text-muted/70 mt-2">{t.projects.join(", ")}</div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                    <th className="px-5 py-2 font-semibold">Member</th>
                    <th className="px-5 py-2 font-semibold">Tasks</th>
                    <th className="px-5 py-2 font-semibold">Completed</th>
                    <th className="px-5 py-2 font-semibold">Delayed</th>
                  </tr>
                </thead>
                <tbody>
                  {t.members.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-4 text-center text-muted">
                        No tasks assigned yet.
                      </td>
                    </tr>
                  )}
                  {t.members.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                      <td className="px-5 py-2.5 text-ink font-medium">{m.name}</td>
                      <td className="px-5 py-2.5 text-muted tabular-nums">{m.tasks}</td>
                      <td className="px-5 py-2.5 text-success font-medium tabular-nums">{m.completed}</td>
                      <td className={`px-5 py-2.5 tabular-nums font-medium ${m.delayed ? "text-danger" : "text-muted"}`}>
                        {m.delayed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
