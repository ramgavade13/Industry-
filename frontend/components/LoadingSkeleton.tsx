export function KPISkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-4 animate-pulse">
          <div className="h-3 w-24 bg-[#242B3D] rounded" />
          <div className="h-6 w-20 bg-[#242B3D] rounded mt-3" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5 animate-pulse">
      <div className="h-3 w-40 bg-[#242B3D] rounded mb-4" />
      <div className="w-full bg-[#0F1420] rounded" style={{ height }} />
    </div>
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5 animate-pulse">
      <div className="h-3 w-32 bg-[#242B3D] rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 bg-[#0F1420] rounded" />
        ))}
      </div>
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-6 py-6 animate-pulse">
          <div className="h-4 w-2/3 bg-[#242B3D] rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-[#0F1420] rounded" />
            <div className="h-10 bg-[#0F1420] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}