"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth";

const ROLES = ["ceo", "admin", "manager", "employee"] as const;
type Role = (typeof ROLES)[number];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Invalid email or password.");
        return;
      }

      const data = await res.json();
      if (!ROLES.includes(data.role)) {
        setError("Your account has an unrecognised role. Contact an administrator.");
        return;
      }

      setSession(data.role as Role, data.token, data.refresh, data.name);
      router.push(`/dashboard/${data.role}`);
    } catch {
      setError("Cannot reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-background text-ink overflow-x-hidden flex items-center justify-center p-4 sm:p-6 lg:p-12">
      {/* Subtle background glow shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-10 left-1/4 w-96 h-96 rounded-full bg-brand/10 blur-3xl animate-pulse-glow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-10 right-1/4 w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Rich Animated Hero */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:pr-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface/80 backdrop-blur-sm shadow-sm w-fit">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold text-ink">AI Executive Decision Agent</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold font-display text-ink tracking-tight leading-[1.15]">
              Turn business data into{" "}
              <span className="bg-gradient-to-r from-brand via-amber-600 to-amber-700 bg-clip-text text-transparent">
                decisions you can act on
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-xl leading-relaxed">
              One unified executive platform for cross-functional KPIs, financial health, project risk forecasts, and AI recommendations backed by clear evidence.
            </p>
          </div>

          {/* Floating Sample KPI Glass Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Tile 1: Floating Glass Card */}
            <div className="animate-float glass-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between text-xs text-muted mb-1 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold uppercase tracking-wider text-[11px] truncate">Quarterly Revenue</span>
                  <span className="text-[10px] font-medium text-muted/70 bg-surface-subtle px-1.5 py-0.5 rounded border border-border/60 shrink-0">Sample preview</span>
                </div>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-success-subtle text-success text-[10px] font-bold border border-success-border shrink-0">
                  ↑ 18.4%
                </span>
              </div>
              <div className="text-2xl font-bold font-display text-ink tracking-tight tabular-nums">
                ₹14.82 Cr
              </div>
              {/* Animated looping sparkline */}
              <div className="mt-2.5 h-7 w-full overflow-hidden flex items-end">
                <svg className="w-full h-6" viewBox="0 0 160 30" fill="none">
                  <path
                    className="animate-sparkline stroke-brand"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    d="M 2 24 C 20 22, 35 12, 50 18 C 65 24, 80 8, 95 12 C 110 16, 125 4, 140 6 C 148 7, 155 3, 158 2"
                  />
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.0" />
                  </linearGradient>
                </svg>
              </div>
            </div>

            {/* Tile 2: Floating Glass Card (Reverse Float) */}
            <div className="animate-float-reverse glass-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between text-xs text-muted mb-1 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold uppercase tracking-wider text-[11px] truncate">Project Delivery</span>
                  <span className="text-[10px] font-medium text-muted/70 bg-surface-subtle px-1.5 py-0.5 rounded border border-border/60 shrink-0">Sample preview</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-subtle text-success text-[10px] font-bold border border-success-border shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> On Track
                </span>
              </div>
              <div className="text-2xl font-bold font-display text-ink tracking-tight tabular-nums">
                94.6%
              </div>
              <div className="mt-3 w-full bg-surface-subtle border border-border/80 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[94.6%]" />
              </div>
            </div>
          </div>

          {/* Quick value props / tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["Real-time Executive Chat", "Voice Assistant", "Risk Prediction", "Role-based Dashboards"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-surface/70 border border-border text-muted"
              >
                <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: The Login Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            data-animate-in
            className="w-full max-w-md rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-md p-6 sm:p-8 shadow-raised"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-brand/20 mb-3">
                <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">Industry Enterprise</div>
              <h2 className="mt-1 text-2xl font-bold font-display text-ink tracking-tight">Welcome back</h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">Sign in to your executive dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/90 mb-1.5">Email address</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/90 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-2.5 text-xs font-semibold text-danger flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-brand w-full py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-ink" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-brand hover:text-brand-hover hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
