"use client";

import { getFreshAuthHeaders } from "@/lib/auth";

export type ReportType = "executive" | "kpi" | "financial" | "risk";

export async function downloadReport(type: ReportType) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${type}/`, {
      headers: { ...(await getFreshAuthHeaders()) },
    });

    if (res.status === 401) {
      alert("Your session has expired. Please log in again.");
      return;
    }
    if (res.status === 403) {
      alert("You don't have permission to download this report.");
      return;
    }
    if (!res.ok) {
      alert("Could not generate the report. Please try again.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    alert("Cannot reach the server. Is the backend running?");
  }
}