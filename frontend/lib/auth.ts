"use client";

import type { Role } from "@/components/DashboardLayout";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function setSession(role: Role, token?: string, refresh?: string, name?: string) {
  setCookie("role", role, 60 * 60 * 24);
  if (token) setCookie("token", token, 60 * 30);
  if (refresh) setCookie("refresh", refresh, 60 * 60 * 24 * 7);
  if (name) setCookie("name", name, 60 * 60 * 24);
}

export function clearSession() {
  for (const key of ["role", "token", "refresh", "name"]) {
    document.cookie = `${key}=; path=/; max-age=0`;
  }
}

export function getToken(): string | null {
  return getCookie("token");
}

export function getRole(): string | null {
  return getCookie("role");
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type RefreshResult = "ok" | "none" | "expired" | "error";

// Swap the refresh token for a new access token.
//  ok      = new access token saved
//  none    = no refresh token stored (user is not logged in)
//  expired = refresh token rejected, session cleared, user must log in again
//  error   = server unreachable, nothing changed
export async function refreshAccessToken(): Promise<RefreshResult> {
  const refresh = getCookie("refresh");
  if (!refresh) return "none";

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.status === 401) {
      clearSession();
      return "expired";
    }
    if (!res.ok) return "error";

    const data = await res.json();
    setCookie("token", data.access, 60 * 30);
    if (data.refresh) setCookie("refresh", data.refresh, 60 * 60 * 24 * 7);
    return "ok";
  } catch {
    return "error";
  }
}

// Like authHeaders(), but renews an expired access token first.
export async function getFreshAuthHeaders(): Promise<Record<string, string>> {
  if (!getToken()) await refreshAccessToken();
  return authHeaders();
}