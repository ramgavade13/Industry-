"use client";

import { useState, useTransition } from "react";
import type { DecisionStatus, RecommendationRow } from "@/lib/recommendationTypes";
import { formatDateTime } from "@/lib/userTypes";

const confidenceColor: Record<string, string> = {
  High: "bg-success-subtle text-success border-success-border",
  Medium: "bg-warning-subtle text-warning border-warning-border",
  Low: "bg-slate-100 text-slate-700 border-slate-300",
};

export default function RecommendationsList({
  recommendations,
  setStatus,
}: {
  recommendations: RecommendationRow[];
  setStatus: (id: string, status: DecisionStatus) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function decide(id: string, status: DecisionStatus) {
    setBusyId(id);
    startTransition(async () => {
      await setStatus(id, status);
      setBusyId(null);
    });
  }

  if (recommendations.length === 0) {
    return (
      <div className="card rounded-2xl px-6 py-10 text-center text-sm text-muted bg-surface border border-border shadow-card">
        <svg className="w-8 h-8 text-muted/60 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        No recommendations here.
      </div>
    );
  }

  return (
    <div data-animate-in className="space-y-4">
      {recommendations.map((rec) => {
        const busy = busyId === rec.id;
        const decidedLine =
          rec.status !== "New"
            ? `${rec.status} by ${rec.decided_by || "a team member"}${
                rec.decided_at ? ` on ${formatDateTime(rec.decided_at)}` : ""
              }`
            : "";

        // Dismissed: a short, dimmed card with an Undo button.
        if (rec.status === "Dismissed") {
          return (
            <div
              key={rec.id}
              className="card rounded-xl px-6 py-4 bg-surface-subtle/80 border border-border opacity-75 flex items-center justify-between gap-4 shadow-sm"
            >
              <div>
                <div className="text-sm font-semibold text-muted line-through">{rec.title}</div>
                <div className="text-xs text-muted/80 mt-0.5">{decidedLine}</div>
              </div>
              <button
                disabled={busy}
                onClick={() => decide(rec.id, "New")}
                className="shrink-0 text-xs font-semibold text-brand hover:text-brand-hover hover:underline transition-colors disabled:opacity-50"
              >
                {busy ? "Saving…" : "Undo"}
              </button>
            </div>
          );
        }

        return (
          <div
            key={rec.id}
            className={`card rounded-2xl px-6 py-6 transition-all bg-surface border shadow-card hover:shadow-card-hover ${
              rec.status === "Accepted"
                ? "border-emerald-500/40 bg-gradient-to-r from-success-subtle/30 via-surface to-surface"
                : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-bold font-display text-ink tracking-tight">{rec.title}</h3>
              <div className="flex shrink-0 items-center gap-2">
                {rec.status === "Accepted" && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-success-subtle text-success border-success-border">
                    ACCEPTED
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    confidenceColor[rec.confidence] ?? confidenceColor.Low
                  }`}
                >
                  {rec.confidence.toUpperCase()} CONFIDENCE
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border/70">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Problem</div>
                <p className="text-xs sm:text-sm text-ink/90 mt-1 leading-relaxed">{rec.problem}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border/70">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Evidence</div>
                <p className="text-xs sm:text-sm text-ink/90 mt-1 leading-relaxed">{rec.evidence}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-subtle/50 border border-brand/20">
                <div className="text-[10px] font-bold uppercase tracking-wider text-brand">Suggested action</div>
                <p className="text-xs sm:text-sm text-ink font-semibold mt-1 leading-relaxed">{rec.action}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary-subtle/60 border border-secondary/20">
                <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">Expected impact</div>
                <p className="text-xs sm:text-sm text-ink font-semibold mt-1 leading-relaxed">{rec.impact}</p>
              </div>
            </div>

            {rec.status === "New" ? (
              <div className="mt-6 flex gap-3 pt-3 border-t border-border/70">
                <button
                  disabled={busy}
                  onClick={() => decide(rec.id, "Accepted")}
                  className="btn-brand text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Accept"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => decide(rec.id, "Dismissed")}
                  className="text-xs rounded-xl border border-border bg-surface text-muted font-semibold px-4 py-2 hover:bg-surface-subtle hover:text-ink transition-colors shadow-sm disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="mt-5 flex items-center justify-between gap-4 pt-3 border-t border-border/70">
                <div className="text-xs text-muted font-medium">{decidedLine}</div>
                <button
                  disabled={busy}
                  onClick={() => decide(rec.id, "New")}
                  className="text-xs font-semibold text-brand hover:text-brand-hover hover:underline transition-colors disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Undo"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
