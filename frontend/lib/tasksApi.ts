import { authFetch } from "./projectsApi";
import type { TaskOptions, TaskRow } from "./taskTypes";

export async function fetchTasks(
  filters: { q?: string; status?: string; project?: string } = {}
): Promise<TaskRow[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.project) params.set("project", filters.project);
  const query = params.toString();

  const res = await authFetch(`/api/tasks/${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error(`Request for tasks failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : data;
}

export async function fetchTask(id: string): Promise<TaskRow | null> {
  const res = await authFetch(`/api/tasks/${id}/`);
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Request for task ${id} failed: ${res.status}`);
  return res.json();
}

export async function fetchTaskOptions(): Promise<TaskOptions> {
  const res = await authFetch("/api/tasks/options/");
  if (!res.ok) return { employees: [], projects: [] };
  return res.json();
}