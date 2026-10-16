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
  return (
    <div className="min-h-[300px] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-[#E7E4DC]">
          Something went wrong
        </h2>

        <p className="text-sm text-[#8B93A7] mt-2">
          We could not load {label}. Please try again.
        </p>

        <button
          onClick={reset}
          className="mt-4 px-4 py-2 rounded-md bg-[#C9A227] text-[#0F1420] text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}