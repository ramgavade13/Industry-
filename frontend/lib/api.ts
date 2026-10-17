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

  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status}`);
  }

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
export type ExecutiveAnalysis = {
  status: string;
  executive_summary: string;
  attention_level: {
    level: string;
    reasons: string[];
    assessment_type: string;
  };
  financial_report: {
    analysis:
      | {
          total_revenue?: number | string;
          total_expenses?: number | string;
          total_profit?: number | string;
          profit_margin_percent?: number | string;
          [key: string]: unknown;
        }
      | string;
    recommendations: string[];
  };
  project_risk_report: {
    status: string;
    total_projects_analyzed: number;
    high_risk_projects: number;
    medium_risk_projects: number;
    low_risk_projects: number;
    projects: Array<{
      project_id: string;
      project_name: string;
      risk_level: string;
      budget_used_percentage: number;
      progress_percentage: number;
      days_remaining: number;
      delayed_tasks: number;
    }>;
    recommendations: string[];
  };
  productivity_report: {
    status: string;
    total_tasks: number;
    completed_tasks: number;
    incomplete_tasks: number;
    overdue_tasks: number;
    delayed_tasks: number;
    completion_rate_percent: number;
    employees: unknown[];
    recommendations: string[];
  };
  recommendation_report: {
  status: string;
  mode: string;
  recommendation_count: number;
  recommendations: Array<{
    priority: string;
    area: string;
    recommendation: string;
    reason: string;
  }>;
  };
};

export const mockExecutiveAnalysis: ExecutiveAnalysis = {
  status: "success",
  executive_summary:
    "Overall company performance is positive with steady revenue growth. Operational margins are holding steady at 33.3%, with active AI recommendations addressing current project risks.",
  attention_level: {
    level: "HIGH",
    reasons: ["1 project(s) identified with high risk", "1 project(s) flagged for medium risk"],
    assessment_type: "Automated AI Analysis",
  },
  financial_report: {
    analysis: {
      total_revenue: 4260000,
      total_expenses: 2840000,
      total_profit: 1420000,
      profit_margin_percent: 33.3,
    },
    recommendations: [
      "Maintain conservative hiring plan through Q4",
      "Shift resources to high-impact projects",
    ],
  },
  project_risk_report: {
    status: "active",
    total_projects_analyzed: 3,
    high_risk_projects: 1,
    medium_risk_projects: 1,
    low_risk_projects: 1,
    projects: [
      {
        project_id: "P001",
        project_name: "Mobile App Revamp",
        risk_level: "HIGH",
        budget_used_percentage: 82,
        progress_percentage: 45,
        days_remaining: 14,
        delayed_tasks: 2,
      },
      {
        project_id: "P002",
        project_name: "Data Warehouse Migration",
        risk_level: "MEDIUM",
        budget_used_percentage: 65,
        progress_percentage: 60,
        days_remaining: 30,
        delayed_tasks: 1,
      },
      {
        project_id: "P003",
        project_name: "Customer Portal",
        risk_level: "LOW",
        budget_used_percentage: 40,
        progress_percentage: 75,
        days_remaining: 45,
        delayed_tasks: 0,
      },
    ],
    recommendations: [
      "Reassign 2 backend engineers to assist with Mobile App Revamp",
    ],
  },
  productivity_report: {
    status: "active",
    total_tasks: 12,
    completed_tasks: 8,
    incomplete_tasks: 4,
    overdue_tasks: 1,
    delayed_tasks: 1,
    completion_rate_percent: 66.7,
    employees: [],
    recommendations: [
      "Schedule mid-sprint review for engineering blockers",
    ],
  },
  recommendation_report: {
    status: "active",
    mode: "AI Executive Agent",
    recommendation_count: 2,
    recommendations: [
      {
        priority: "HIGH",
        area: "Customer Retention",
        recommendation: "Launch a guided onboarding program for new customers.",
        reason: "Customer churn increased by 0.6% this quarter.",
      },
      {
        priority: "MEDIUM",
        area: "Engineering Allocation",
        recommendation: "Move two engineers to the app revamp project.",
        reason: "Mobile app delivery is two sprints behind schedule.",
      },
    ],
  },
};

export async function fetchExecutiveAnalysis(): Promise<ExecutiveAnalysis> {
  try {
    return await getJSON<ExecutiveAnalysis>("/api/executive-analysis/");
  } catch (err) {
    console.warn("Could not fetch live executive analysis from backend, falling back to cached analysis.", err);
    return mockExecutiveAnalysis;
  }
}