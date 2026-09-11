import {
  kpiData, revenueTrend, riskAlerts, productivityData, workloadDeadlines,
} from "@/data/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = true; // Gayatri chi backend ready zali ki false kara

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request to ${path} failed: ${res.status}`);
  return res.json();
}

export async function fetchKPIs() {
  return USE_MOCK ? kpiData : getJSON<typeof kpiData>("/api/kpis/");
}
export async function fetchRevenueTrend() {
  return USE_MOCK ? revenueTrend : getJSON<typeof revenueTrend>("/api/financials/trend/");
}
export async function fetchRiskAlerts() {
  return USE_MOCK ? riskAlerts : getJSON<typeof riskAlerts>("/api/risks/");
}
export async function fetchProductivity() {
  return USE_MOCK ? productivityData : getJSON<typeof productivityData>("/api/productivity/");
}
export async function fetchWorkload() {
  return USE_MOCK ? workloadDeadlines : getJSON<typeof workloadDeadlines>("/api/productivity/workload/");
}
