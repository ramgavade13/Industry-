import Link from "next/link";

const MODULES = [
  { label: "KPI Monitoring", detail: "Track targets, spot trends before they become problems" },
  { label: "Financial Insights", detail: "Revenue, expenses, and cash flow in one clear view" },
  { label: "Risk Prediction", detail: "Flag projects likely to slip or overrun, early" },
  { label: "AI Recommendations", detail: "Evidence-backed suggestions, not black-box answers" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F1420] text-[#E7E4DC]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #C9A227, transparent)" }}
      />
      <section data-animate-in className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <span className="rounded-full border border-[#242B3D] bg-[#161C2C] px-4 py-1.5 text-xs text-[#8B93A7]">
          Built for CEOs and senior management
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          Turn business data into<br />decisions you can act on
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#8B93A7] sm:text-lg">
          One dashboard for KPIs, finances, project risk, and forecasts —
          with AI recommendations that explain the evidence, not just the answer.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/login" className="rounded-lg bg-[#C9A227] px-7 py-3 font-semibold text-[#0F1420] transition-colors hover:bg-[#DDB646]">
            Login
          </Link>
          <Link href="/signup" className="rounded-lg border border-[#242B3D] px-7 py-3 font-semibold text-[#E7E4DC] transition-colors hover:bg-[#161C2C]">
            Create account
          </Link>
        </div>
        <div className="mt-20 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div key={m.label} className="rounded-lg border border-[#242B3D] bg-[#161C2C] px-5 py-5 text-left transition-colors hover:border-[#C9A227]/40">
              <div className="text-sm font-semibold text-[#E7E4DC]">{m.label}</div>
              <p className="mt-2 text-xs leading-5 text-[#8B93A7]">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}