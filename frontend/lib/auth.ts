"use client";

import type { Role } from "@/components/DashboardLayout";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function setSession(role: Role, token?: string, refresh?: string, name?: string) {
  setCookie("role", role, 60 * 60 * 24);
  if (token) setCookie("token", token, 60 * 30); // backend access token lasts 30 min
  if (refresh) setCookie("refresh", refresh, 60 * 60 * 24 * 7); // 7 days
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

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}