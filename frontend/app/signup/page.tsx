"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          email,
          password,
          first_name: name,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const first = Object.values(data)[0];
        const message = Array.isArray(first) ? String(first[0]) : "Could not create the account.";
        setError(message);
        return;
      }

      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Cannot reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm";

  return (
    <main className="relative min-h-screen bg-background text-ink overflow-x-hidden flex items-center justify-center p-4 sm:p-6 lg:p-12">
      {/* Moving background glow shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-10 left-1/4 w-96 h-96 rounded-full bg-brand/10 blur-3xl animate-pulse-glow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-10 right-1/4 w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "3s" }}
      />

      <div data-animate-in className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-md p-6 sm:p-8 shadow-raised">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-brand/20 mb-3">
            <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Industry Enterprise</div>
          <h1 className="mt-1 text-2xl font-bold font-display text-ink tracking-tight">Create your account</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">New accounts start with Employee access</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink/90 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/90 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/90 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/90 mb-1.5">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-2.5 text-xs font-semibold text-danger flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-ink" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Creating account…</span>
              </>
            ) : (
              <span>Sign Up for Access</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-hover hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
