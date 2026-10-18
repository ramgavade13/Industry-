import DashboardLayout from "@/components/DashboardLayout";
import { fetchProjects } from "@/lib/api";

const riskBadge: Record<string, string> = {
  high: "bg-[#D65F5F]/15 text-[#D65F5F] border-[#D65F5F]/40",
  medium: "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/40",
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
];

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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const projects = await fetchProjects({ q, status });

  return (
    <DashboardLayout
      role="ceo"
      title="Projects"
      subtitle="Progress, budget and risk for every project"
    >
      <form method="get" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by project or team"
          className="bg-[#161C2C] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] placeholder:text-[#5C6580] w-72"
        />
        <select
          name="status"
          defaultValue={status}
          className="bg-[#161C2C] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#C9A227] text-[#0F1420] rounded-md px-4 py-2 text-sm font-medium"
        >
          Apply
        </button>
        {(q || status) && (
          <a href="/projects" className="px-2 py-2 text-sm text-[#8B93A7] hover:text-[#E7E4DC]">
            Clear
          </a>
        )}
      </form>

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D] flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">All projects</h3>
          <span className="text-xs text-[#8B93A7]">{projects.length} shown</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Team</th>
              <th className="px-5 py-3 font-medium w-48">Progress</th>
              <th className="px-5 py-3 font-medium">Budget</th>
              <th className="px-5 py-3 font-medium">Deadline</th>
              <th className="px-5 py-3 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-[#8B93A7]">
                  No projects match your search.
                </td>
              </tr>
            )}
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-[#242B3D] last:border-0">
                <td className="px-5 py-3 text-[#E7E4DC]">
                  {p.name}
                  <div className="text-xs text-[#5C6580] capitalize">{p.status.replace("_", " ")}</div>
                </td>
                <td className="px-5 py-3 text-[#8B93A7]">
                  {p.team}
                  <div className="text-xs text-[#5C6580]">{p.team_size} people</div>
                </td>
                <td className="px-5 py-3">
                  <div className="h-2 rounded bg-[#242B3D] overflow-hidden">
                    <div className="h-2 bg-[#C9A227]" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="text-xs text-[#8B93A7] mt-1">{p.progress}%</div>
                </td>
                <td className={`px-5 py-3 ${p.budget_used_pct > 100 ? "text-[#D65F5F]" : "text-[#8B93A7]"}`}>
                  {lakh(p.spent)} of {lakh(p.budget)}
                  <div className="text-xs">{p.budget_used_pct}% used</div>
                </td>
                <td className="px-5 py-3 text-[#8B93A7]">
                  {formatDate(p.end_date)}
                  <div className={`text-xs ${p.days_left !== null && p.days_left < 10 ? "text-[#D65F5F]" : "text-[#5C6580]"}`}>
                    {p.days_left === null
                      ? ""
                      : p.days_left < 0
                      ? `${Math.abs(p.days_left)} days overdue`
                      : `${p.days_left} days left`}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {riskBadge[p.risk] ? (
                    <span className={`inline-block rounded border px-2 py-0.5 text-xs uppercase ${riskBadge[p.risk]}`}>
                      {p.risk}
                    </span>
                  ) : (
                    <span className="text-xs text-[#3FA77C]">Low</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}