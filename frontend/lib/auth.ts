"use client";

import type { Role } from "@/components/DashboardLayout";

export function setSession(
  role: Role,
  token?: string,
  refresh?: string,
  name?: string
) {
  document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax`;
  if (token) {
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    try {
      if (token) localStorage.setItem("access_token", token);
      if (refresh) localStorage.setItem("refresh_token", refresh);
      if (name) localStorage.setItem("user_name", name);
      localStorage.setItem("user_role", role);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}

export function clearSession() {
  document.cookie = "role=; path=/; max-age=0";
  document.cookie = "token=; path=/; max-age=0";
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_role");
    } catch {
      // Ignore
    }
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}