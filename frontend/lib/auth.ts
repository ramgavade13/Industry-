"use client";

import type { Role } from "@/components/DashboardLayout";

export function setSession(role: Role) {
  document.cookie = `role=${role}; path=/; max-age=86400`;
}

export function clearSession() {
  document.cookie = "role=; path=/; max-age=0";
}