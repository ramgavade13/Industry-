"use client";

import { useState } from "react";

const confidenceColor = {
  High: "bg-[#3FA77C]/15 text-[#3FA77C] border-[#3FA77C]/30",
  Medium: "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30",
  Low: "bg-[#8B93A7]/15 text-[#8B93A7] border-[#8B93A7]/30",
};

interface AIRecommendation {
  id: string;
  title: string;
  confidence: "High" | "Medium" | "Low";
  problem: string;
  evidence: string;
  action: string;
  impact: string;
}

type Status = "pending" | "accepted" | "dismissed";

export default function RecommendationsList({ recommendations }: { recommendations: AIRecommendation[] }) {
  // id -> status, so each card tracks its own Accept/Dismiss state
  const [statusById, setStatusById] = useState<Record<string, Status>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleDecision(id: string, decision: "accepted" | "dismissed") {
    setSavingId(id);
    try {
      // Swap this URL for your real backend endpoint when it's ready.
      // Until then this fetch will fail silently and we still update the UI.
      await fetch(`/api/ai/recommendations/${id}/${decision}/`, { method: "POST" }).catch(() => null);
      setStatusById((prev) => ({ ...prev, [id]: decision }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div data-animate-in className="space-y-4">
      {recommendations.map((rec) => {
        const status = statusById[rec.id] ?? "pending";
        if (status === "dismissed") return null; // remove dismissed cards from view

        return (
          <div
            key={rec.id}
            className={`bg-[#161C2C] border rounded-lg px-6 py-6 transition-colors ${
              status === "accepted" ? "border-[#3FA77C]/40" : "border-[#242B3D]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold text-[#E7E4DC]">{rec.title}</h3>
              <div className="flex shrink-0 items-center gap-2">
                {status === "accepted" && (
                  <span className="text-[10px] px-2 py-1 rounded border bg-[#3FA77C]/15 text-[#3FA77C] border-[#3FA77C]/30">
                    ACCEPTED
                  </span>
                )}
                <span className={`text-[10px] px-2 py-1 rounded border ${confidenceColor[rec.confidence]}`}>
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

            {status === "pending" && (
              <div className="mt-5 flex gap-3">
                <button
                  disabled={savingId === rec.id}
                  onClick={() => handleDecision(rec.id, "accepted")}
                  className="text-xs rounded-md bg-[#C9A227] text-[#0F1420] font-semibold px-4 py-2 hover:bg-[#DDB646] transition-colors disabled:opacity-50"
                >
                  {savingId === rec.id ? "Saving…" : "Accept"}
                </button>
                <button
                  disabled={savingId === rec.id}
                  onClick={() => handleDecision(rec.id, "dismissed")}
                  className="text-xs rounded-md border border-[#242B3D] text-[#8B93A7] font-semibold px-4 py-2 hover:bg-[#0F1420] transition-colors disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        );
      })}

      {recommendations.every((rec) => statusById[rec.id] === "dismissed") && recommendations.length > 0 && (
        <p className="text-sm text-[#8B93A7]">All recommendations reviewed.</p>
      )}
    </div>
  );
}