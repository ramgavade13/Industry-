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
    "w-full rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]";

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
          <h1 className="mt-2 text-xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-[#8B93A7]">New accounts start with Employee access</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs text-[#8B93A7] mb-1.5">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className={inputClass} />
          </div>

          {error && <p className="text-xs text-[#D65F5F]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#C9A227] py-2.5 text-sm font-semibold text-[#0F1420] transition-colors hover:bg-[#DDB646] disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#8B93A7]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C9A227] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}