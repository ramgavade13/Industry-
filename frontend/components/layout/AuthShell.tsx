"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import BusinessScene from "@/components/three/BusinessScene";

interface AuthShellProps {
  title: string;
  children: ReactNode;
}

/** Wrap the login / signup / forgot-password pages in this. */
export default function AuthShell({ title, children }: AuthShellProps) {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(card.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" });
    }, card);
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16 text-white">
      <BusinessScene />
      <div
        ref={card}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md"
      >
        <h1 className="mb-8 text-center text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </main>
  );
}