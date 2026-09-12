"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type Role = "ceo" | "admin" | "manager" | "employee";

const NAV_BY_ROLE: Record<Role, { href: string; label: string }[]> = {
  ceo: [
    { href: "/dashboard/ceo", label: "Overview" },
    { href: "/productivity", label: "Team Productivity" },
    { href: "/forecasting", label: "Forecasting" },
    { href: "/recommendations", label: "AI Recommendations" },
    { href: "/reports", label: "Reports" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/users", label: "User Management" },
  ],
  manager: [
    { href: "/dashboard/manager", label: "My Team" },
    { href: "/productivity", label: "Team Productivity" },
  ],
  employee: [
    { href: "/dashboard/employee", label: "My Tasks" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  ceo: "CEO",
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
};

export default function DashboardLayout({
  role,
  title,
  subtitle,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role];

  return (
    <div className="min-h-screen bg-[#0F1420] text-[#E7E4DC] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-[#242B3D] flex flex-col">
        <div className="px-6 py-6 border-b border-[#242B3D]">
          <div className="text-[#C9A227] text-sm tracking-wide font-semibold">
            Industry
          </div>
          <div className="text-xs text-[#8B93A7] mt-1">
            AI Executive Decision Agent
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#1B2233] text-[#E7E4DC] border-l-2 border-[#C9A227] pl-[10px]"
                    : "text-[#8B93A7] hover:text-[#E7E4DC] hover:bg-[#161C2C]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-[#242B3D] text-xs text-[#5C6580]">
          Logged in as {ROLE_LABEL[role]}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-6 border-b border-[#242B3D] flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#E7E4DC]">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#8B93A7] mt-1">{subtitle}</p>
            )}
          </div>
          <div className="text-xs text-[#5C6580]">
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}