"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ROLES = ["ceo", "admin", "manager", "employee"] as const;
type Role = (typeof ROLES)[number];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ceo");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");

    // TODO: replace with a real call once Gayatri's Django auth API is ready.
    // The API should return the user's actual role — the dropdown below is
    // only a stand-in until then, so the frontend can be tested end-to-end.
    //
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, password }),
    // });
    // if (!res.ok) { setError("Invalid email or password."); return; }
    // const data = await res.json();
    // router.push(`/dashboard/${data.role}`);

    console.log("Login attempt:", { email, role });
    router.push(`/dashboard/${role}`);
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
          <p className="mt-1 text-sm text-[#8B93A7]">Sign in to your executive dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]"
            />
          </div>

          {/* Temporary until Gayatri's login API returns the real role */}
          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">
              Login as (temporary — backend will decide this later)
            </label>
            <select
              value={role} onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-[#D65F5F]">{error}</p>}

          <button type="submit" className="w-full rounded-md bg-[#C9A227] py-2.5 text-sm font-semibold text-[#0F1420] transition-colors hover:bg-[#DDB646]">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#8B93A7]">
          Don&apos;t have an account? <Link href="/signup" className="text-[#C9A227] hover:underline">Create one</Link>
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