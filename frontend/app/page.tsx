import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
          AI-Powered Business Intelligence
        </p>

        <h1 className="max-w-4xl text-4xl font-bold sm:text-6xl">
          AI Executive Decision Agent
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Monitor KPIs, analyze financial performance, predict project risks,
          forecast business trends, and receive AI-powered recommendations.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg border border-slate-600 px-6 py-3 font-semibold transition hover:bg-slate-800"
          >
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}
