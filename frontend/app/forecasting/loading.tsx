import { KPISkeletonRow, ChartSkeleton, PanelSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div>
      <KPISkeletonRow count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <PanelSkeleton rows={3} />
      </div>
    </div>
  );
}