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
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div
        ref={card}
        className="w-full max-w-sm rounded-2xl border border-[#242B3D] bg-[#0F1420]/75 p-8 shadow-2xl backdrop-blur-md"
      >
        <h1 className="mb-8 text-center text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </main>
  );
}
