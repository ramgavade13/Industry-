"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

const navItems = [
  { label: "CEO Dashboard", href: "/dashboard/ceo" },
  { label: "Admin Dashboard", href: "/dashboard/admin" },
  { label: "Manager Dashboard", href: "/dashboard/manager" },
  { label: "Employee Dashboard", href: "/dashboard/employee" },
  { label: "Productivity", href: "/productivity" },
  { label: "Forecasting", href: "/forecasting" },
];

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0F1420] text-[#E7E4DC]">
      {/* Animated background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#C9A227]/5 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl"
        />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#242B3D] bg-[#111827]/90 backdrop-blur-xl md:flex md:flex-col">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-[#242B3D] px-6 py-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
              Industry
            </p>

            <h2 className="mt-2 text-lg font-bold">
              AI Executive
            </h2>

            <p className="text-sm text-[#8B93A7]">
              Decision Agent
            </p>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item, index) => {
              const active = pathname === item.href;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.06,
                  }}
                >
                  <Link
                    href={item.href}
                    className={`relative block overflow-hidden rounded-lg px-4 py-3 text-sm transition-colors ${
                      active
                        ? "text-[#E7E4DC]"
                        : "text-[#8B93A7] hover:bg-[#161C2C] hover:text-[#E7E4DC]"
                    }`}
                  >
                    {/* Active animated background */}
                    {active && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-lg border border-[#C9A227]/20 bg-[#C9A227]/10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          active
                            ? "bg-[#C9A227]"
                            : "bg-[#242B3D]"
                        }`}
                      />

                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-t border-[#242B3D] p-4"
          >
            <p className="text-xs text-[#8B93A7]">
              AI Executive Decision Agent
            </p>

            <p className="mt-1 text-xs text-[#C9A227]">
              System Online
            </p>
          </motion.div>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top header */}
          <motion.header
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="sticky top-0 z-20 border-b border-[#242B3D] bg-[#0F1420]/80 px-6 py-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8B93A7]">
                  Executive Intelligence
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  {title}
                </h1>
              </div>

              {/* Status indicator */}
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="hidden items-center gap-2 rounded-full border border-[#3FA77C]/20 bg-[#3FA77C]/10 px-3 py-2 text-xs text-[#3FA77C] sm:flex"
              >
                <span className="h-2 w-2 rounded-full bg-[#3FA77C]" />
                AI System Online
              </motion.div>
            </div>
          </motion.header>

          {/* Page content */}
          <main className="flex-1 px-6 py-8 lg:px-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
