"use client";

type ErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
  label?: string;
};

export default function ErrorState({
  error,
  reset,
  label = "this page",
}: ErrorStateProps) {
  if (process.env.NODE_ENV === "development" && error) {
    // Keep error reference for debugging in dev
    console.warn("ErrorState captured:", error.message);
  }

  return (
    <div className="min-h-[340px] flex items-center justify-center px-4 py-10">
      <div className="card rounded-2xl p-8 max-w-md w-full text-center bg-surface border border-border shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-danger-subtle text-danger mx-auto flex items-center justify-center mb-4 border border-danger-border">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold font-display text-ink tracking-tight">
          Something went wrong
        </h2>

        <p className="text-sm text-muted mt-2 leading-relaxed">
          We could not load {label}. Please try again.
        </p>

        <button
          onClick={reset}
          className="btn-brand mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
