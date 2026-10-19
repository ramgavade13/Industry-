import { authFetch } from "./projectsApi";
import type { ManagedUser, TeamRow } from "./userTypes";

async function listOf<T>(res: Response, what: string): Promise<T[]> {
  if (!res.ok) throw new Error(`Request for ${what} failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : data;
}

export async function fetchManagedUsers(
  filters: { q?: string; role?: string; status?: string } = {}
): Promise<ManagedUser[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  const res = await authFetch(`/api/accounts/manage/users/${query ? `?${query}` : ""}`);
  return listOf<ManagedUser>(res, "users");
}

export async function fetchManagedUser(id: string): Promise<ManagedUser | null> {
  const res = await authFetch(`/api/accounts/manage/users/${id}/`);
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Request for user ${id} failed: ${res.status}`);
  return res.json();
}

export async function fetchProfile(): Promise<ManagedUser> {
  const res = await authFetch("/api/accounts/me/profile/");
  if (!res.ok) throw new Error(`Request for profile failed: ${res.status}`);
  return res.json();
}

export async function fetchTeams(): Promise<TeamRow[]> {
  const res = await authFetch("/api/teams/");
  return listOf<TeamRow>(res, "teams");
}