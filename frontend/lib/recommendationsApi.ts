import { authFetch } from "./projectsApi";
import type { RecommendationRow } from "./recommendationTypes";

export async function fetchRecommendations(): Promise<RecommendationRow[]> {
  const res = await authFetch("/api/recommendations/");
  if (!res.ok) throw new Error(`Request for recommendations failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : data;
}