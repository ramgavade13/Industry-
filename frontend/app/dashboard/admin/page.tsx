import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { fetchAdminStats } from "@/lib/api";
import { fetchManagedUsers } from "@/lib/usersApi";
import { ROLE_LABEL, ROLE_OPTIONS, formatDateTime } from "@/lib/userTypes";

const MESSAGES: Record<string, string> = {
  created: "User created.",
  updated: "User updated.",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string; msg?: string }>;
}) {
  const { q = "", role = "", status = "", msg = "" } = await searchParams;
  const [systemStats, users] = await Promise.all([
    fetchAdminStats(),
    fetchManagedUsers({ q, role, status }),
  ]);
  const banner = MESSAGES[msg];

  return (
    <DashboardLayout role="admin" title="Admin Dashboard" subtitle="Users, access, and system health">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((s) => <KPICard key={s.label} {...s} />)}
      </div>

      {banner && (
        <div className="mt-6 rounded-md border border-[#3FA77C]/40 bg-[#3FA77C]/10 px-4 py-3 text-sm text-[#3FA77C]">
          {banner}
        </div>
      )}

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D] flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">
            User Management <span className="text-xs text-[#8B93A7] font-normal ml-2">{users.length} shown</span>
          </h3>
          <Link
            href="/dashboard/admin/users/new"
            className="text-xs rounded-md bg-[#C9A227] text-[#0F1420] font-semibold px-3 py-1.5 hover:bg-[#DDB646] transition-colors"
          >
            + Add User
          </Link>
        </div>

        <form method="get" className="flex flex-wrap gap-3 px-5 py-4 border-b border-[#242B3D]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, username or email"
            className="bg-[#0F1420] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] placeholder:text-[#5C6580] w-72"
          />
          <select
            name="role"
            defaultValue={role}
            className="bg-[#0F1420] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC]"
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            className="bg-[#0F1420] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC]"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className="bg-[#242B3D] text-[#E7E4DC] rounded-md px-4 py-2 text-sm font-medium">
            Apply
          </button>
          {(q || role || status) && (
            <Link href="/dashboard/admin" className="px-2 py-2 text-sm text-[#8B93A7] hover:text-[#E7E4DC]">
              Clear
            </Link>
          )}
        </form>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last Login</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-[#8B93A7]">
                  No users match your search.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#242B3D] last:border-0">
                <td className="px-5 py-3 text-[#E7E4DC]">
                  {u.name}
                  <div className="text-xs text-[#5C6580]">{u.username}</div>
                </td>
                <td className="px-5 py-3 text-[#8B93A7]">{u.email}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className={`px-5 py-3 font-medium ${u.is_active ? "text-[#3FA77C]" : "text-[#8B93A7]"}`}>
                  {u.is_active ? "Active" : "Inactive"}
                </td>
                <td className="px-5 py-3 text-[#8B93A7]">{formatDateTime(u.last_login)}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/admin/users/${u.id}/edit`}
                    className="text-xs text-[#C9A227] hover:text-[#E7E4DC] transition-colors"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}