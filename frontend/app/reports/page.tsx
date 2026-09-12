"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { downloadReport, ReportType } from "@/lib/reportGenerator";

const REPORTS: { type: ReportType; title: string; description: string }[] = [
  { type: "executive", title: "Executive Summary Report", description: "KPIs and risk alerts in one page — for a quick leadership review." },
  { type: "kpi", title: "KPI Report", description: "All tracked KPIs with current values and trend direction." },
  { type: "financial", title: "Financial Report", description: "Monthly revenue vs expenses over the last 6 months." },
  { type: "risk", title: "Risk Report", description: "Flagged project risks alongside team productivity snapshot." },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<ReportType | null>(null);

  async function handleDownload(type: ReportType) {
    setGenerating(type);
    try {
      await downloadReport(type);
    } finally {
      setGenerating(null);
    }
  }

  return (
    <DashboardLayout role="ceo" title="Reports" subtitle="Generate and download management reports">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div key={r.type} className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#E7E4DC]">{r.title}</h3>
              <p className="text-xs text-[#8B93A7] mt-2 leading-5">{r.description}</p>
            </div>
            <button
              onClick={() => handleDownload(r.type)}
              disabled={generating === r.type}
              className="mt-5 w-full rounded-md bg-[#C9A227] text-[#0F1420] text-sm font-semibold py-2.5 transition-colors hover:bg-[#DDB646] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating === r.type ? "Generating…" : "Download PDF"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-[#5C6580]">
        Reports are generated from current mock data. Once Gayatri&apos;s report
        endpoint is live, these buttons will fetch the real PDF/DOCX from the
        backend instead.
      </p>
    </DashboardLayout>
  );
}