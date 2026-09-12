import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { myStats, myTasks } from "@/data/mockData";

const statusColor = {
  "On track": "text-[#3FA77C]", "At risk": "text-[#C9A227]", "Not started": "text-[#8B93A7]",
};

export default function EmployeeDashboardPage() {
  return (
    <DashboardLayout role="employee" title="My Dashboard" subtitle="Your assigned tasks and deadlines">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {myStats.map((s) => <KPICard key={s.label} {...s} />)}
      </div>

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D]">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">My Tasks</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {myTasks.map((t) => (
              <tr key={t.task} className="border-b border-[#242B3D] last:border-0">
                <td className="px-5 py-3 text-[#E7E4DC]">{t.task}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{t.due}</td>
                <td className={`px-5 py-3 font-medium ${statusColor[t.status]}`}>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
