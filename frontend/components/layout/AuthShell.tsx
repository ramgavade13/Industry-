"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";

export default function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(card.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" });
    }, card);
    return () => ctx.revert();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 bg-background text-ink">
      <div
        ref={card}
        className="w-full max-w-md rounded-2xl border border-border/80 bg-surface/95 p-8 shadow-raised backdrop-blur-md"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-brand/20 mb-3">
            <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Industry</div>
          <h1 className="mt-1 text-center text-2xl font-bold font-display text-ink tracking-tight">{title}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}
