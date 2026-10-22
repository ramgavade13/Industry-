"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clearSession, getRole } from "@/lib/auth";
import PageTransition from "./PageTransition";

export type Role = "ceo" | "admin" | "manager" | "employee";

// Menus follow the SRS page-and-role table (Section 14).
const NAV_BY_ROLE: Record<Role, { href: string; label: string; icon: string }[]> = {
  ceo: [
    { href: "/dashboard/ceo", label: "Overview", icon: "overview" },
    { href: "/projects", label: "Projects", icon: "projects" },
    { href: "/tasks", label: "Tasks", icon: "tasks" },
    { href: "/teams", label: "Teams", icon: "teams" },
    { href: "/risk", label: "Risk", icon: "risk" },
    { href: "/productivity", label: "Team Productivity", icon: "productivity" },
    { href: "/forecasting", label: "Forecasting", icon: "forecasting" },
    { href: "/recommendations", label: "AI Recommendations", icon: "recommendations" },
    { href: "/reports", label: "Reports", icon: "reports" },
    { href: "/chat", label: "Executive Chat", icon: "chat" },
    { href: "/voice", label: "Voice Assistant", icon: "voice" },
    { href: "/profile", label: "My Profile", icon: "profile" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview & Users", icon: "admin" },
    { href: "/projects", label: "Projects", icon: "projects" },
    { href: "/tasks", label: "Tasks", icon: "tasks" },
    { href: "/teams", label: "Teams", icon: "teams" },
    { href: "/risk", label: "Risk", icon: "risk" },
    { href: "/productivity", label: "Team Productivity", icon: "productivity" },
    { href: "/forecasting", label: "Forecasting", icon: "forecasting" },
    { href: "/recommendations", label: "AI Recommendations", icon: "recommendations" },
    { href: "/reports", label: "Reports", icon: "reports" },
    { href: "/chat", label: "Executive Chat", icon: "chat" },
    { href: "/voice", label: "Voice Assistant", icon: "voice" },
    { href: "/profile", label: "My Profile", icon: "profile" },
  ],
  manager: [
    { href: "/dashboard/manager", label: "My Team", icon: "manager" },
    { href: "/projects", label: "Projects", icon: "projects" },
    { href: "/tasks", label: "Tasks", icon: "tasks" },
    { href: "/teams", label: "Teams", icon: "teams" },
    { href: "/risk", label: "Risk", icon: "risk" },
    { href: "/productivity", label: "Team Productivity", icon: "productivity" },
    { href: "/reports", label: "Reports", icon: "reports" },
    { href: "/chat", label: "Executive Chat", icon: "chat" },
    { href: "/voice", label: "Voice Assistant", icon: "voice" },
    { href: "/profile", label: "My Profile", icon: "profile" },
  ],
  employee: [
    { href: "/dashboard/employee", label: "My Tasks", icon: "employee" },
    { href: "/chat", label: "Executive Chat", icon: "chat" },
    { href: "/voice", label: "Voice Assistant", icon: "voice" },
    { href: "/profile", label: "My Profile", icon: "profile" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  ceo: "CEO",
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
};

const ROLE_INITIALS: Record<Role, string> = {
  ceo: "CE",
  admin: "AD",
  manager: "MG",
  employee: "EM",
};

const noopSubscribe = () => () => {};

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const strokeClass = active ? "stroke-brand" : "stroke-muted group-hover:stroke-ink";
  switch (name) {
    case "overview":
    case "admin":
    case "manager":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <rect width="7" height="9" x="3" y="3" rx="1.5" />
          <rect width="7" height="5" x="14" y="3" rx="1.5" />
          <rect width="7" height="9" x="14" y="12" rx="1.5" />
          <rect width="7" height="5" x="3" y="16" rx="1.5" />
        </svg>
      );
    case "projects":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "tasks":
    case "employee":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="m9 11 3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "teams":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "risk":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
    case "productivity":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="polyline" />
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "forecasting":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="m13 13 6 6" />
        </svg>
      );
    case "recommendations":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      );
    case "reports":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case "chat":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      );
    case "voice":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      );
    case "profile":
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      );
    default:
      return (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${strokeClass}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use the logged-in user's real role (from the cookie); the `role` prop is only the
  // fallback for the server render and for pages that don't know the role.
  const cookieRole = useSyncExternalStore(noopSubscribe, () => getRole(), () => null);
  const activeRole: Role =
    cookieRole && cookieRole in NAV_BY_ROLE ? (cookieRole as Role) : role;
  const navItems = NAV_BY_ROLE[activeRole];

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface">
      {/* Brand Logo Block */}
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <Link href={`/dashboard/${activeRole}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-brand/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base text-ink tracking-tight">Industry</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[11px] text-muted font-medium tracking-tight">
              AI Decision Agent
            </div>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-subtle"
          aria-label="Close navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                active
                  ? "bg-brand-subtle/80 text-brand font-semibold shadow-sm"
                  : "text-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand shadow-sm shadow-brand/40"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <NavIcon name={item.icon} active={active} />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card & Logout at Bottom */}
      <div className="p-3 border-t border-border">
        <div className="p-3 rounded-xl bg-surface-subtle border border-border flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-brand/20">
              {ROLE_INITIALS[activeRole] || "US"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-ink truncate">
                {ROLE_LABEL[activeRole]}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-subtle text-brand border border-brand/20">
                  {ROLE_LABEL[activeRole]}
                </span>
                <span className="text-[10px] text-muted truncate">Active</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-muted hover:text-danger hover:bg-danger-subtle border border-transparent hover:border-danger-border transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-ink flex">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border flex-col sticky top-0 h-screen z-30 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 px-4 sm:px-8 py-4 sm:py-5 border-b border-border bg-surface/90 backdrop-blur-md flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl border border-border bg-surface text-ink hover:bg-surface-subtle shadow-sm transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-ink tracking-tight truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface shadow-sm text-xs font-medium text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
