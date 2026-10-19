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
          className="bg-[#161C2C] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] placeholder:text-[#5C6580] w-72"
        />
        <button type="submit" className="bg-[#242B3D] text-[#E7E4DC] rounded-md px-4 py-2 text-sm font-medium">
          Apply
        </button>
        {q && (
          <Link href="/teams" className="px-2 py-2 text-sm text-[#8B93A7] hover:text-[#E7E4DC]">
            Clear
          </Link>
        )}
      </form>

      {teams.length === 0 && (
        <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-6 text-center text-sm text-[#8B93A7]">
          No teams match your search.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {teams.map((t) => (
          <div key={t.team} className="bg-[#161C2C] border border-[#242B3D] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#242B3D]">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-[#E7E4DC]">{t.team}</h3>
                <span className="text-xs text-[#8B93A7]">
                  {t.project_count} project{t.project_count !== 1 ? "s" : ""} · {t.member_count} member
                  {t.member_count !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-2 rounded bg-[#242B3D] overflow-hidden mt-3">
                <div className="h-2 bg-[#C9A227]" style={{ width: `${t.completion_rate}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[#8B93A7] mt-1">
                <span>
                  {t.tasks_completed} of {t.tasks_total} tasks completed ({t.completion_rate}%)
                </span>
                <span className={t.tasks_delayed ? "text-[#D65F5F]" : ""}>{t.tasks_delayed} delayed</span>
              </div>
              {t.projects.length > 0 && (
                <div className="text-xs text-[#5C6580] mt-2">{t.projects.join(", ")}</div>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
                  <th className="px-5 py-2 font-medium">Member</th>
                  <th className="px-5 py-2 font-medium">Tasks</th>
                  <th className="px-5 py-2 font-medium">Completed</th>
                  <th className="px-5 py-2 font-medium">Delayed</th>
                </tr>
              </thead>
              <tbody>
                {t.members.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-4 text-center text-[#8B93A7]">
                      No tasks assigned yet.
                    </td>
                  </tr>
                )}
                {t.members.map((m) => (
                  <tr key={m.id} className="border-b border-[#242B3D] last:border-0">
                    <td className="px-5 py-2 text-[#E7E4DC]">{m.name}</td>
                    <td className="px-5 py-2 text-[#8B93A7]">{m.tasks}</td>
                    <td className="px-5 py-2 text-[#3FA77C]">{m.completed}</td>
                    <td className={`px-5 py-2 ${m.delayed ? "text-[#D65F5F]" : "text-[#8B93A7]"}`}>{m.delayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}