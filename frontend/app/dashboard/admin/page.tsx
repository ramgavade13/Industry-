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
        <div className="mt-6 rounded-lg border border-success-border bg-success-subtle px-4 py-3 text-sm text-success font-medium">
          {banner}
        </div>
      )}

      <div className="card rounded-xl mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">
            User Management <span className="text-xs text-muted font-normal ml-2">{users.length} shown</span>
          </h3>
          <Link
            href="/dashboard/admin/users/new"
            className="btn-brand text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-1"
          >
            + Add User
          </Link>
        </div>

        <form method="get" className="flex flex-wrap gap-3 px-5 py-4 border-b border-border">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, username or email"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full sm:w-72 transition-all"
          />
          <select
            name="role"
            defaultValue={role}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
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
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-border bg-surface-subtle px-4 py-2 text-sm font-medium text-ink hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            Apply
          </button>
          {(q || role || status) && (
            <Link href="/dashboard/admin" className="px-2 py-2 text-sm text-muted hover:text-ink transition-colors">
              Clear
            </Link>
          )}
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-surface-subtle">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Last Login</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No users match your search.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">
                    {u.name}
                    <div className="text-xs text-muted font-normal">{u.username}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3 text-muted">{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${u.is_active ? "badge-low" : "badge-medium"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted tabular-nums">{formatDateTime(u.last_login)}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/admin/users/${u.id}/edit`}
                      className="text-xs font-semibold text-brand hover:text-brand-hover hover:underline focus:outline-none focus:ring-2 focus:ring-brand/30 rounded transition-colors"
                    >
                      Edit
                    </Link>
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
