"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import BusinessScene from "@/components/three/BusinessScene";

const MODULES = [
  { label: "KPI Monitoring", detail: "Track targets, spot trends before they become problems" },
  { label: "Financial Insights", detail: "Revenue, expenses, and cash flow in one clear view" },
  { label: "Risk Prediction", detail: "Flag projects likely to slip or overrun, early" },
  { label: "AI Recommendations", detail: "Evidence-backed suggestions, not black-box answers" },
];

export default function Home() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // One entrance sequence. The 3D chart grows at the same time.
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-badge", { opacity: 0, y: 12, duration: 0.5 })
        .from(".hero-line", { yPercent: 110, duration: 0.9, stagger: 0.14 }, "-=0.2")
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.7 }, "-=0.4")
        .from(".hero-cta", { opacity: 0, y: 16, duration: 0.5, stagger: 0.1 }, "-=0.3")
        .from(".module-card", { opacity: 0, y: 24, duration: 0.6, stagger: 0.1 }, "-=0.2");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className="relative min-h-screen overflow-hidden text-[#E7E4DC]">
      <BusinessScene />

      {/* dark centre shade so the text stays readable over the 3D scene */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(15,20,32,0.78) 0%, rgba(15,20,32,0.4) 55%, rgba(15,20,32,0) 85%)",
        }}
      />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <span className="hero-badge rounded-full border border-[#242B3D] bg-[#161C2C]/80 px-4 py-1.5 text-xs text-[#8B93A7]">
          Built for CEOs and senior management
        </span>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          <span className="block overflow-hidden pb-1">
            <span className="hero-line block">Turn business data into</span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span className="hero-line block">decisions you can act on</span>
          </span>
        </h1>

        <p className="hero-sub mt-6 max-w-xl text-base leading-7 text-[#8B93A7] sm:text-lg">
          One dashboard for KPIs, finances, project risk, and forecasts —
          with AI recommendations that explain the evidence, not just the answer.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="hero-cta rounded-lg bg-[#C9A227] px-7 py-3 font-semibold text-[#0F1420] transition-colors hover:bg-[#DDB646]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="hero-cta rounded-lg border border-[#242B3D] bg-[#0F1420]/40 px-7 py-3 font-semibold text-[#E7E4DC] transition-colors hover:bg-[#161C2C]"
          >
            Create account
          </Link>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div
              key={m.label}
              className="module-card rounded-lg border border-[#242B3D] bg-[#161C2C]/70 px-5 py-5 text-left backdrop-blur-sm transition-colors hover:border-[#C9A227]/40"
            >
              <div className="text-sm font-semibold text-[#E7E4DC]">{m.label}</div>
              <p className="mt-2 text-xs leading-5 text-[#8B93A7]">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
