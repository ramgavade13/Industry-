"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth";

const ROLES = ["ceo", "admin", "manager", "employee"] as const;
type Role = (typeof ROLES)[number];

type Variant = "home" | "login";

const MODULES = [
  { label: "KPI Monitoring", detail: "Track executive targets and spot trends early, before they slip" },
  { label: "Financial Insights", detail: "Revenue, expenses and forecasts in one clear view" },
  { label: "Risk Prediction", detail: "Flags projects likely to overrun their delivery deadlines" },
  { label: "AI Recommendations", detail: "Evidence-backed options with clear, verifiable reasoning" },
];

const TAGS = ["Real-time Executive Chat", "Voice Assistant", "Risk Prediction", "Role-based Dashboards"];

const WORDS = ["decisions", "insights", "priorities"];

const ALERTS = [
  { dot: "bg-danger", text: "Risk flagged: Project Atlas may slip by 6 days" },
  { dot: "bg-success", text: "Revenue is 18.4% above last quarter" },
  { dot: "bg-brand", text: "Recommendation: move 2 engineers to Project Phoenix" },
  { dot: "bg-secondary", text: "Forecast: Q4 expenses within 3% of budget" },
];

const SPARK =
  "M 2 24 C 20 22, 35 12, 50 18 C 65 24, 80 8, 95 12 C 110 16, 125 4, 140 6 C 148 7, 155 3, 158 2";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Counts from 0 up to `target`. Jumps straight to the target if the user prefers reduced motion. */
function useCountUp(target: number, duration = 1600, delay = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const timer = setTimeout(() => {
      const tick = (now: number) => {
        if (!start) start = now;
        const p = Math.min((now - start) / duration, 1);
        setValue(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}

/* "decisions" -> "insights" -> "priorities", fading in place. All words share one grid cell so the width never jumps. */
function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setIndex((n) => (n + 1) % WORDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-grid align-bottom">
      {WORDS.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== index}
          className={`word-swap col-start-1 row-start-1 bg-gradient-to-r from-brand via-amber-600 to-amber-700 bg-clip-text text-transparent ${
            i === index ? "is-active" : ""
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

/* Glass card that tilts toward the mouse and shows a soft light under the pointer. */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * 8).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * 10).toFixed(2)}deg`);
    el.style.setProperty("--glow-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--glow-y", `${((py + 0.5) * 100).toFixed(1)}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt-card glass-card rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function Ticker() {
  return (
    <div className="ticker glass flex items-center overflow-hidden rounded-xl">
      <span className="shrink-0 border-r border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-light">
        Sample alerts
      </span>
      <div className="ticker-mask min-w-0 flex-1 overflow-hidden py-2">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {ALERTS.map((a) => (
                <span
                  key={`${copy}-${a.text}`}
                  className="flex items-center gap-2 whitespace-nowrap pl-6 pr-4 text-xs text-muted"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
                  {a.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return { "--d": `${ms}ms` } as React.CSSProperties;
}

export default function LoginHero({ variant }: { variant: Variant }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const revenue = useCountUp(14.82, 1600, 700);
  const delivery = useCountUp(94.6, 1600, 900);

  const cardRef = useRef<HTMLDivElement>(null);

  function onCardMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

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
      setDone(true);
      const target = `/dashboard/${data.role}`;
      // Let the tick animation play briefly before moving on.
      if (prefersReducedMotion()) router.push(target);
      else setTimeout(() => router.push(target), 650);
    } catch {
      setError("Cannot reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const isHome = variant === "home";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-ink flex items-center justify-center p-4 sm:p-6 lg:p-12">
      {/* Background: faint dot grid and three slowly drifting colour orbs */}
      <div aria-hidden="true" className="hero-grid pointer-events-none fixed inset-0" />
      <div
        aria-hidden="true"
        className="animate-drift-a pointer-events-none fixed left-[8%] top-[6%] h-96 w-96 rounded-full bg-brand/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift-b pointer-events-none fixed bottom-[4%] right-[10%] h-[28rem] w-[28rem] rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift-c pointer-events-none fixed left-[42%] top-[48%] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left side: animated hero */}
        <div className="flex flex-col justify-center space-y-6 lg:col-span-7 lg:pr-4">
          <div
            className="reveal inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm"
            style={delay(0)}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            <span className="text-xs font-semibold text-ink">
              {isHome ? "Built for CEOs and senior management" : "AI Executive Decision Agent"}
            </span>
          </div>

          <div className="space-y-3">
            <h1
              className="reveal font-display text-3xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl"
              style={delay(120)}
            >
              Turn business data into <RotatingWord /> you can act on
            </h1>
            <p className="reveal max-w-xl text-sm leading-relaxed text-muted sm:text-base" style={delay(240)}>
              {isHome
                ? "One executive dashboard for KPIs, finances, project risk and forecasts, with AI recommendations that explain the evidence, not just the answer."
                : "One unified executive platform for cross-functional KPIs, financial health, project risk forecasts and AI recommendations backed by clear evidence."}
            </p>
          </div>

          {/* Floating sample KPI tiles */}
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <div className="reveal" style={delay(360)}>
              <div className="animate-float">
                <TiltCard className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Quarterly Revenue
                    </span>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-success-border bg-success-subtle px-2 py-0.5 text-[10px] font-bold text-success">
                      {"\u2191 18.4% YoY"}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold tracking-tight text-ink tabular-nums">
                    {"\u20B9"}
                    {revenue.toFixed(2)} Cr
                  </div>
                  <div className="mt-2.5 h-8 w-full">
                    <svg className="h-8 w-full overflow-visible" viewBox="0 0 160 32" fill="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c99400" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#c99400" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path className="spark-area" d={`${SPARK} L 158 32 L 2 32 Z`} fill="url(#sparkFill)" />
                      <path
                        className="spark-line stroke-brand"
                        pathLength={1}
                        d={SPARK}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle className="spark-dot-ring fill-brand" cx="158" cy="2" r="4" />
                      <circle className="spark-dot fill-brand" cx="158" cy="2" r="2.6" />
                    </svg>
                  </div>
                  <div className="mt-2 text-[10px] font-medium text-muted-light">Sample preview</div>
                </TiltCard>
              </div>
            </div>

            <div className="reveal" style={delay(480)}>
              <div className="animate-float-reverse">
                <TiltCard className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Delivery &amp; Risk
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-border bg-success-subtle px-2 py-0.5 text-[10px] font-bold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> On Track
                    </span>
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold tracking-tight text-ink tabular-nums">
                    {delivery.toFixed(1)}%
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-border/80 bg-surface-subtle">
                    <div className="bar-fill h-full w-[94.6%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  </div>
                  <div className="mt-3 text-[10px] font-medium text-muted-light">Sample preview</div>
                </TiltCard>
              </div>
            </div>
          </div>

          {isHome ? (
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              {MODULES.map((m, i) => (
                <div key={m.label} className="reveal" style={delay(600 + i * 90)}>
                  <TiltCard className="!rounded-xl p-3.5">
                    <div className="text-xs font-bold text-ink">{m.label}</div>
                    <p className="mt-1 text-[11px] leading-4 text-muted">{m.detail}</p>
                  </TiltCard>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {TAGS.map((tag, i) => (
                <span
                  key={tag}
                  className="reveal inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/70 px-3 py-1 text-xs font-medium text-muted"
                  style={delay(600 + i * 80)}
                >
                  <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="reveal" style={delay(isHome ? 1000 : 900)}>
            <Ticker />
          </div>
        </div>

        {/* Right side: login card */}
        <div className="flex justify-center lg:col-span-5">
          <div
            ref={cardRef}
            onPointerMove={onCardMove}
            data-animate-in
            className="spotlight relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-6 shadow-raised backdrop-blur-md sm:p-8"
          >
            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand via-amber-500 to-amber-600 font-bold text-slate-950 shadow-md shadow-brand/20">
                <svg className="h-6 w-6 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">Industry Enterprise</div>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">Welcome back</h2>
              <p className="mt-1 text-xs text-muted sm:text-sm">Sign in to your executive dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink/90">Email address</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition-all placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink/90">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={"\u2022".repeat(8)}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition-all placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-2.5 text-xs font-semibold text-danger">
                  <svg className="h-4 w-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || done}
                className="btn-brand btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
              >
                {done ? (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        className="check-draw"
                        pathLength={1}
                        d="M5 12.5l4.5 4.5L19 7.5"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Welcome</span>
                  </>
                ) : loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-ink" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Signing in{"\u2026"}</span>
                  </>
                ) : (
                  <span>{isHome ? "Login" : "Sign In to Dashboard"}</span>
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