"use client";

import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

type KPI = { label: string; value: string; change: string; trend: "up" | "down" };

export default function KPICard({ label, value, change, trend }: KPI) {
  const isUp = trend === "up";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="card-glow rounded-xl p-5 relative overflow-hidden bg-surface group"
    >
      {/* Subtle top indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
          isUp ? "bg-emerald-500/80" : "bg-rose-500/80"
        } opacity-70 group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        <div
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
            isUp ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
          }`}
        >
          {isUp ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
            </svg>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight tabular-nums">
          <AnimatedNumber value={value} />
        </div>
        {change && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              isUp
                ? "bg-success-subtle text-success border border-success-border"
                : "bg-danger-subtle text-danger border border-danger-border"
            }`}
          >
            <span>{isUp ? "↑" : "↓"}</span>
            <span>{change}</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
