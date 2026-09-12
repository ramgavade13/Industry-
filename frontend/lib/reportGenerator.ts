"use client";

// Generates a simple PDF in the browser so the "Download Report" button
// actually works today. Once Gayatri's Django endpoint (ReportLab / python-docx)
// is ready, replace the body of downloadReport() with a fetch to that endpoint
// and skip straight to saving the returned blob — see the comment at the bottom.

import { jsPDF } from "jspdf";
import {
  kpiData,
  revenueTrend,
  riskAlerts,
  productivityData,
} from "@/data/mockData";

export type ReportType = "executive" | "kpi" | "financial" | "risk";

const REPORT_TITLES: Record<ReportType, string> = {
  executive: "Executive Summary Report",
  kpi: "KPI Report",
  financial: "Financial Report",
  risk: "Risk Report",
};

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(15, 20, 32);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(201, 162, 39);
  doc.setFontSize(11);
  doc.text("INDUSTRY — AI Executive Decision Agent", 14, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setTextColor(20, 20, 20);
}

function addFooter(doc: jsPDF) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${date}`, 14, 287);
}

function buildExecutiveSummary(doc: jsPDF) {
  let y = 42;
  doc.setFontSize(13);
  doc.text("Key Performance Indicators", 14, y);
  y += 8;
  doc.setFontSize(10);
  kpiData.forEach((k) => {
    doc.text(`• ${k.label}: ${k.value}  (${k.change})`, 16, y);
    y += 7;
  });

  y += 6;
  doc.setFontSize(13);
  doc.text("Risk Alerts", 14, y);
  y += 8;
  doc.setFontSize(10);
  riskAlerts.forEach((r) => {
    doc.text(`• ${r.project} — ${r.risk} [${r.severity.toUpperCase()}]`, 16, y);
    y += 7;
  });
}

function buildKpiReport(doc: jsPDF) {
  let y = 42;
  doc.setFontSize(10);
  kpiData.forEach((k) => {
    doc.text(`${k.label}`, 16, y);
    doc.text(`${k.value}`, 100, y);
    doc.text(`${k.change}`, 140, y);
    y += 8;
  });
}

function buildFinancialReport(doc: jsPDF) {
  let y = 42;
  doc.setFontSize(11);
  doc.text("Month", 16, y);
  doc.text("Revenue (L)", 70, y);
  doc.text("Expenses (L)", 130, y);
  y += 8;
  doc.setFontSize(10);
  revenueTrend.forEach((r) => {
    doc.text(`${r.month}`, 16, y);
    doc.text(`${r.revenue}`, 70, y);
    doc.text(`${r.expenses}`, 130, y);
    y += 7;
  });
}

function buildRiskReport(doc: jsPDF) {
  let y = 42;
  doc.setFontSize(10);
  riskAlerts.forEach((r) => {
    doc.text(`${r.project}`, 16, y);
    y += 6;
    doc.setTextColor(120, 120, 120);
    doc.text(`${r.risk} — Severity: ${r.severity.toUpperCase()}`, 16, y);
    doc.setTextColor(20, 20, 20);
    y += 10;
  });

  y += 4;
  doc.setFontSize(11);
  doc.text("Team Productivity Snapshot", 14, y);
  y += 8;
  doc.setFontSize(10);
  productivityData.forEach((p) => {
    doc.text(`${p.team}: ${p.completed}% completed, ${p.pending}% pending`, 16, y);
    y += 7;
  });
}

export async function downloadReport(type: ReportType) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, REPORT_TITLES[type]);

  if (type === "executive") buildExecutiveSummary(doc);
  if (type === "kpi") buildKpiReport(doc);
  if (type === "financial") buildFinancialReport(doc);
  if (type === "risk") buildRiskReport(doc);

  addFooter(doc);
  doc.save(`${type}-report.pdf`);

  // --- Once the backend is ready, replace everything above with: ---
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${type}/`);
  // const blob = await res.blob();
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // a.href = url;
  // a.download = `${type}-report.pdf`;
  // a.click();
  // URL.revokeObjectURL(url);
}