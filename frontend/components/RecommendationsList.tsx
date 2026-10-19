"use client";

import { useState, useTransition } from "react";
import type { DecisionStatus, RecommendationRow } from "@/lib/recommendationTypes";
import { formatDateTime } from "@/lib/userTypes";

const confidenceColor: Record<string, string> = {
  High: "bg-[#3FA77C]/15 text-[#3FA77C] border-[#3FA77C]/30",
  Medium: "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30",
  Low: "bg-[#8B93A7]/15 text-[#8B93A7] border-[#8B93A7]/30",
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
      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-6 py-6 text-sm text-[#8B93A7]">
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
              className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-6 py-4 opacity-70 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-sm text-[#8B93A7]">{rec.title}</div>
                <div className="text-xs text-[#5C6580] mt-1">{decidedLine}</div>
              </div>
              <button
                disabled={busy}
                onClick={() => decide(rec.id, "New")}
                className="shrink-0 text-xs text-[#C9A227] hover:text-[#E7E4DC] transition-colors disabled:opacity-50"
              >
                {busy ? "Saving…" : "Undo"}
              </button>
            </div>
          );
        }

        return (
          <div
            key={rec.id}
            className={`bg-[#161C2C] border rounded-lg px-6 py-6 transition-colors ${
              rec.status === "Accepted" ? "border-[#3FA77C]/40" : "border-[#242B3D]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold text-[#E7E4DC]">{rec.title}</h3>
              <div className="flex shrink-0 items-center gap-2">
                {rec.status === "Accepted" && (
                  <span className="text-[10px] px-2 py-1 rounded border bg-[#3FA77C]/15 text-[#3FA77C] border-[#3FA77C]/30">
                    ACCEPTED
                  </span>
                )}
                <span
                  className={`text-[10px] px-2 py-1 rounded border ${
                    confidenceColor[rec.confidence] ?? confidenceColor.Low
                  }`}
                >
                  {rec.confidence.toUpperCase()} CONFIDENCE
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Problem</div>
                <p className="text-sm text-[#8B93A7] mt-1 leading-5">{rec.problem}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Evidence</div>
                <p className="text-sm text-[#8B93A7] mt-1 leading-5">{rec.evidence}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Suggested action</div>
                <p className="text-sm text-[#E7E4DC] mt-1 leading-5">{rec.action}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Expected impact</div>
                <p className="text-sm text-[#E7E4DC] mt-1 leading-5">{rec.impact}</p>
              </div>
            </div>

            {rec.status === "New" ? (
              <div className="mt-5 flex gap-3">
                <button
                  disabled={busy}
                  onClick={() => decide(rec.id, "Accepted")}
                  className="text-xs rounded-md bg-[#C9A227] text-[#0F1420] font-semibold px-4 py-2 hover:bg-[#DDB646] transition-colors disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Accept"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => decide(rec.id, "Dismissed")}
                  className="text-xs rounded-md border border-[#242B3D] text-[#8B93A7] font-semibold px-4 py-2 hover:bg-[#0F1420] transition-colors disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="text-xs text-[#5C6580]">{decidedLine}</div>
                <button
                  disabled={busy}
                  onClick={() => decide(rec.id, "New")}
                  className="text-xs text-[#C9A227] hover:text-[#E7E4DC] transition-colors disabled:opacity-50"
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