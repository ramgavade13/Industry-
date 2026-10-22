import { cookies } from "next/headers";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import { fetchProjects } from "@/lib/api";
import { deleteProject } from "./actions";

// Maps risk level to badge utility classes from globals.css
const riskBadge: Record<string, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
];

const MESSAGES: Record<string, { text: string; good: boolean }> = {
  created: { text: "Project created.", good: true },
  updated: { text: "Project updated.", good: true },
  deleted: { text: "Project deleted.", good: true },
  denied: { text: "You are not allowed to delete projects.", good: false },
};

function lakh(n: number) {
  return `₹${(n / 100000).toFixed(1)}L`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const filterInputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; msg?: string }>;
}) {
  const { q = "", status = "", msg = "" } = await searchParams;
  const projects = await fetchProjects({ q, status });
  const role = (await cookies()).get("role")?.value;
  const canDelete = role === "ceo" || role === "admin";
  const banner = MESSAGES[msg];

  return (
    <DashboardLayout
      role="ceo"
      title="Projects"
      subtitle="Progress, budget and risk for every project"
    >
      {banner && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm font-medium ${
            banner.good
              ? "border-success-border bg-success-subtle text-success"
              : "border-danger-border bg-danger-subtle text-danger"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by project or team"
            className={`${filterInputClass} w-full sm:w-72`}
          />
          <select
            name="status"
            defaultValue={status}
            className={filterInputClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-border bg-surface-subtle px-4 py-2 text-sm font-medium text-ink hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            Apply
          </button>
          {(q || status) && (
            <Link href="/projects" className="px-2 py-2 text-sm text-muted hover:text-ink transition-colors">
              Clear
            </Link>
          )}
        </form>

        <Link
          href="/projects/new"
          className="btn-brand text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-1"
        >
          + Add project
        </Link>
      </div>

      <div className="card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-ink">All projects</h3>
          <span className="text-xs text-muted">{projects.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Team</th>
                <th className="px-5 py-3 font-semibold w-48">Progress</th>
                <th className="px-5 py-3 font-semibold">Budget</th>
                <th className="px-5 py-3 font-semibold">Deadline</th>
                <th className="px-5 py-3 font-semibold">Risk</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted">
                    No projects match your search.
                  </td>
                </tr>
              )}
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">
                    {p.name}
                    <div className="text-xs text-muted font-normal capitalize">{p.status.replace("_", " ")}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {p.team}
                    <div className="text-xs text-muted/70">{p.team_size} people</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-2 rounded-full bg-surface-subtle border border-border overflow-hidden">
                      <div className="h-2 bg-brand rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <div className="text-xs text-muted mt-1 tabular-nums">{p.progress}%</div>
                  </td>
                  <td className={`px-5 py-3 tabular-nums ${p.budget_used_pct > 100 ? "text-danger font-semibold" : "text-muted"}`}>
                    {lakh(p.spent)} of {lakh(p.budget)}
                    <div className="text-xs">{p.budget_used_pct}% used</div>
                  </td>
                  <td className="px-5 py-3 text-muted tabular-nums">
                    {formatDate(p.end_date)}
                    <div className={`text-xs ${p.days_left !== null && p.days_left < 10 ? "text-danger font-semibold" : "text-muted/70"}`}>
                      {p.days_left === null
                        ? ""
                        : p.days_left < 0
                        ? `${Math.abs(p.days_left)} days overdue`
                        : `${p.days_left} days left`}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${riskBadge[p.risk] ?? "badge-low"}`}>
                      {p.risk ? p.risk.charAt(0).toUpperCase() + p.risk.slice(1) : "Low"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/projects/${p.id}/edit`}
                        className="text-xs font-semibold text-brand hover:text-brand-hover hover:underline focus:outline-none focus:ring-2 focus:ring-brand/30 rounded transition-colors"
                      >
                        Edit
                      </Link>
                      {canDelete && <DeleteProjectButton action={deleteProject.bind(null, p.id)} />}
                    </div>
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
