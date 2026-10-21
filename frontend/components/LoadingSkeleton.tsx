export function KPISkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card rounded-xl px-5 py-4 animate-pulse bg-surface border border-border shadow-card">
          <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
          <div className="h-7 w-20 bg-slate-200 rounded-md mt-3" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="card rounded-xl px-5 py-5 animate-pulse bg-surface border border-border shadow-card">
      <div className="h-4 w-40 bg-slate-200 rounded-md mb-4" />
      <div className="w-full bg-surface-subtle border border-border/50 rounded-xl" style={{ height }} />
    </div>
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card rounded-xl px-5 py-5 animate-pulse bg-surface border border-border shadow-card">
      <div className="h-4 w-32 bg-slate-200 rounded-md mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 bg-surface-subtle border border-border/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card rounded-xl px-6 py-6 animate-pulse bg-surface border border-border shadow-card">
          <div className="h-4 w-2/3 bg-slate-200 rounded-md mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-surface-subtle border border-border/50 rounded-xl" />
            <div className="h-10 bg-surface-subtle border border-border/50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
