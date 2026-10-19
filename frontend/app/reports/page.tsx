"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { downloadReport, ReportFormat, ReportType } from "@/lib/reportGenerator";

const REPORTS: { type: ReportType; title: string; description: string }[] = [
  { type: "executive", title: "Executive Summary Report", description: "KPIs and risk alerts in one page — for a quick leadership review." },
  { type: "kpi", title: "KPI Report", description: "All tracked KPIs with current values and trend direction." },
  { type: "financial", title: "Financial Report", description: "Monthly revenue, expenses and profit over the last 6 months." },
  { type: "risk", title: "Risk Report", description: "Flagged project risks alongside team productivity snapshot." },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  async function handleDownload(type: ReportType, format: ReportFormat) {
    setGenerating(`${type}-${format}`);
    try {
      await downloadReport(type, format);
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
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload(r.type, "pdf")}
                disabled={generating !== null}
                className="rounded-md bg-[#C9A227] text-[#0F1420] text-sm font-semibold py-2.5 transition-colors hover:bg-[#DDB646] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating === `${r.type}-pdf` ? "Generating…" : "Download PDF"}
              </button>
              <button
                onClick={() => handleDownload(r.type, "docx")}
                disabled={generating !== null}
                className="rounded-md border border-[#C9A227] text-[#C9A227] text-sm font-semibold py-2.5 transition-colors hover:bg-[#C9A227]/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating === `${r.type}-docx` ? "Generating…" : "Download Word"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-[#5C6580]">
        Reports are generated from the live data in the system. The Executive and Financial
        reports are available to the CEO and Administrator only.
      </p>
    </DashboardLayout>
  );
}