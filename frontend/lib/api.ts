import {
  kpiData,
  revenueTrend,
  riskAlerts,
  productivityData,
  workloadDeadlines,
  revenueForecast,
  forecastSummary,
  forecastNotes,
  aiRecommendations,
} from "@/data/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = true; // flip to false once the backend endpoints exist

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request to ${path} failed: ${res.status}`);
  return res.json();
}

export async function fetchKPIs() {
  if (USE_MOCK) return kpiData;
  return getJSON<typeof kpiData>("/api/kpis/");
}

export async function fetchRevenueTrend() {
  if (USE_MOCK) return revenueTrend;
  return getJSON<typeof revenueTrend>("/api/financials/trend/");
}

export async function fetchRiskAlerts() {
  if (USE_MOCK) return riskAlerts;
  return getJSON<typeof riskAlerts>("/api/risks/");
}

export async function fetchProductivity() {
  if (USE_MOCK) return productivityData;
  return getJSON<typeof productivityData>("/api/productivity/");
}

export async function fetchWorkload() {
  if (USE_MOCK) return workloadDeadlines;
  return getJSON<typeof workloadDeadlines>("/api/productivity/workload/");
}

export async function fetchForecastChart() {
  if (USE_MOCK) return revenueForecast;
  return getJSON<typeof revenueForecast>("/api/forecast/revenue/");
}

export async function fetchForecastSummary() {
  if (USE_MOCK) return forecastSummary;
  return getJSON<typeof forecastSummary>("/api/forecast/summary/");
}

export async function fetchForecastNotes() {
  if (USE_MOCK) return forecastNotes;
  return getJSON<typeof forecastNotes>("/api/forecast/notes/");
}

export async function fetchAIRecommendations() {
  if (USE_MOCK) return aiRecommendations;
  return getJSON<typeof aiRecommendations>("/api/recommendations/");
}
