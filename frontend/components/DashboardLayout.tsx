import Link from "next/link";
import { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-slate-900"
          >
            AI Executive Decision Agent
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link
              href="/dashboard/ceo"
              className="text-slate-600 hover:text-blue-600"
            >
              CEO
            </Link>

            <Link
              href="/productivity"
              className="text-slate-600 hover:text-blue-600"
            >
              Productivity
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          {title}
        </h1>

        {children}
      </main>
    </div>
  );
}