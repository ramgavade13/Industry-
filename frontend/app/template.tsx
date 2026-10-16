"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";

// Unlike layout.tsx, template.tsx re-mounts on every route change,
// so this fade plays each time the user opens a page.
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // opacity only: a transform here would break position:fixed children
      gsap.from(ref.current, { opacity: 0, duration: 0.45, ease: "power2.out", clearProps: "opacity" });
    }, ref);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}