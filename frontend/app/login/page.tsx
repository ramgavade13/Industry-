"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth";

const ROLES = ["ceo", "admin", "manager", "employee"] as const;
type Role = (typeof ROLES)[number];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ceo");
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    try {
      const res = await fetch(`${apiUrl}/api/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const userRole = (data.role || "employee") as Role;
        setSession(userRole, data.access || data.token, data.refresh, data.name);
        router.push(`/dashboard/${userRole}`);
        return;
      } else {
        const data = await res.json().catch(() => null);
        const detail = Array.isArray(data?.detail) ? data.detail[0] : data?.detail;
        const errorMsg = detail || "Invalid email or password.";
        setError(errorMsg);
        return;
      }
    } catch {
      // Backend offline fallback for stand-in UI testing
      console.warn("Backend not reachable. Falling back to role selection.");
      setSession(role);
      router.push(`/dashboard/${role}`);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F1420] px-6 text-[#E7E4DC]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #C9A227, transparent)" }}
      />

      <div data-animate-in className="relative w-full max-w-sm rounded-lg border border-[#242B3D] bg-[#161C2C] p-8">
        <div className="text-center">
          <div className="text-[#C9A227] text-sm font-semibold">Industry</div>
          <h1 className="mt-2 text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-[#8B93A7]">
            Sign in to your executive dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" suppressHydrationWarning>
          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              suppressHydrationWarning
              className="w-full rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              suppressHydrationWarning
              className="w-full rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]"
            />
          </div>

          {/* Temporary until Gayatri's login API returns the real role */}
          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">
              Login as (temporary — backend will decide this later)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              suppressHydrationWarning
              className="w-full rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Demo Credentials Autofill */}
          <div className="rounded-md border border-[#242B3D] bg-[#0F1420]/60 p-3">
            <span className="block text-[11px] font-medium text-[#8B93A7] mb-2">
              Demo Credentials (Click to fill):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { role: "CEO", email: "ceo@example.com" },
                { role: "Admin", email: "admin@example.com" },
                { role: "Manager", email: "manager@example.com" },
                { role: "Employee", email: "employee@example.com" },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    setEmail(item.email);
                    setPassword("Demo@1234");
                    setError("");
                  }}
                  className="rounded border border-[#242B3D] bg-[#161C2C] px-2 py-1.5 text-left text-xs text-[#E7E4DC] hover:border-[#C9A227] hover:text-[#C9A227] transition-colors"
                >
                  <span className="font-semibold block text-[10px] text-[#C9A227]">{item.role}</span>
                  <span className="block text-[11px] text-[#8B93A7] truncate">{item.email}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-900/50 bg-red-950/30 p-2.5 text-xs text-[#E57373]">
              <p className="font-medium">{error}</p>
              <p className="mt-1 text-[11px] text-[#8B93A7]">
                Note: Passwords are case-sensitive. Demo password is <span className="font-mono text-[#E7E4DC]">Demo@1234</span> (with a capital <span className="font-mono text-[#C9A227]">D</span>).
              </p>
            </div>
          )}

          <button
            type="submit"
            suppressHydrationWarning
            className="w-full rounded-md bg-[#C9A227] py-2.5 text-sm font-semibold text-[#0F1420] transition-colors hover:bg-[#DDB646]"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#8B93A7]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#C9A227] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
