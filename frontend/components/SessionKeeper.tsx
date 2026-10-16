"use client";

import { useEffect } from "react";
import { getRole, getToken, refreshAccessToken } from "@/lib/auth";

const REFRESH_EVERY_MS = 20 * 60 * 1000; // access tokens last 30 minutes

export default function SessionKeeper() {
  useEffect(() => {
    let stopped = false;

    async function renew() {
      const result = await refreshAccessToken();
      if (stopped) return;

      const onLogin = window.location.pathname === "/login";

      if (result === "expired" && !onLogin) {
        window.location.href = "/login";
      }
      // Came back to /login with a valid refresh token: go straight to the dashboard.
      if (result === "ok" && onLogin) {
        const role = getRole();
        if (role) window.location.href = `/dashboard/${role}`;
      }
    }

    // Access token already gone (tab was asleep, or the user returned later): renew now.
    if (!getToken()) renew();

    const timer = setInterval(renew, REFRESH_EVERY_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && !getToken()) renew();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}