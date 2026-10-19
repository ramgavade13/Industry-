import { authFetch } from "./projectsApi";

export type ProjectForecastRow = {
  id: number;
  name: string;
  team: string;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  projected_finish: string | null;
  days_late: number | null;
  progress_at_deadline: number | null;
  state: string;
  note: string;
};

export type ProjectForecast = {
  summary: Record<string, number>;
  projects: ProjectForecastRow[];
};

// Returns null if the forecast can't be loaded, so the page can still show the rest.
export async function fetchProjectForecast(): Promise<ProjectForecast | null> {
  try {
    const res = await authFetch("/api/forecast/projects/");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}