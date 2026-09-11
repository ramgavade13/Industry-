import DashboardLayout from "@/components/DashboardLayoutV2";
import KPICard from "@/components/KPICard";
import { systemStats, systemUsers } from "@/data/mockData";

const statusColor = { Active: "text-[#3FA77C]", Inactive: "text-[#8B93A7]" };

export default function AdminDashboardPage() {
  return (
    <DashboardLayout role="admin" title="Admin Dashboard" subtitle="Users, access, and system health">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((s) => <KPICard key={s.label} {...s} />)}
      </div>

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">User Management</h3>
          <button className="text-xs rounded-md bg-[#C9A227] text-[#0F1420] font-semibold px-3 py-1.5 hover:bg-[#DDB646] transition-colors">
            + Add User
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {systemUsers.map((u) => (
              <tr key={u.name} className="border-b border-[#242B3D] last:border-0">
                <td className="px-5 py-3 text-[#E7E4DC]">{u.name}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{u.role}</td>
                <td className={`px-5 py-3 font-medium ${statusColor[u.status]}`}>{u.status}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{u.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
