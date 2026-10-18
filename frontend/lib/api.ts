import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  teamOverview,
  teamTasks,
  myStats,
  myTasks,
  systemStats,
  systemUsers,
} from "@/data/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Real backend data by default. Set NEXT_PUBLIC_USE_MOCK=true in .env.local to go back to mock data.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function getToken(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get("token")?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function getJSON<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Token missing or expired: send the user back to log in again.
  if (res.status === 401) redirect("/login");

  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status}`);
  }

  const data = await res.json();
  // Support paginated responses ({ results: [...] }) as well as plain lists.
  return (Array.isArray(data?.results) ? data.results : data) as T;
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

export async function fetchManagerOverview() {
  if (USE_MOCK) return teamOverview;
  return getJSON<typeof teamOverview>("/api/manager/overview/");
}

export async function fetchManagerTasks() {
  if (USE_MOCK) return teamTasks;
  return getJSON<typeof teamTasks>("/api/manager/tasks/");
}

export async function fetchEmployeeStats() {
  if (USE_MOCK) return myStats;
  return getJSON<typeof myStats>("/api/employee/stats/");
}

export async function fetchEmployeeTasks() {
  if (USE_MOCK) return myTasks;
  return getJSON<typeof myTasks>("/api/employee/tasks/");
}

export async function fetchAdminStats() {
  if (USE_MOCK) return systemStats;
  return getJSON<typeof systemStats>("/api/accounts/admin/stats/");
}

export async function fetchAdminUsers() {
  if (USE_MOCK) return systemUsers;
  return getJSON<typeof systemUsers>("/api/accounts/admin/users/");
}

// ---- Projects and detailed risk (no mock data for these) ----

export type RiskDetail = {
  project: string;
  risk: string;
  severity: string;
  score: number | null;
  progress: number | null;
  budget_used_pct: number | null;
};

export type ProjectRow = {
  id: number;
  name: string;
  status: string;
  progress: number;
  team: string;
  team_size: number;
  budget: number;
  spent: number;
  budget_used_pct: number;
  end_date: string | null;
  days_left: number | null;
  manager: string;
  risk: string;
};

export async function fetchRiskDetails(): Promise<RiskDetail[]> {
  if (USE_MOCK) return [];
  return getJSON<RiskDetail[]>("/api/risks/");
}

export async function fetchProjects(filters: { q?: string; status?: string } = {}): Promise<ProjectRow[]> {
  if (USE_MOCK) return [];
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return getJSON<ProjectRow[]>(`/api/projects/${query ? `?${query}` : ""}`);
}