import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ProjectDetail } from "./projectTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Calls the backend with the logged-in user's token. Sends the user to login if it has expired.
export async function authFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) redirect("/login");
  return res;
}

export async function fetchProject(id: string): Promise<ProjectDetail | null> {
  const res = await authFetch(`/api/projects/${id}/`);
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Request for project ${id} failed: ${res.status}`);
  return res.json();
}