import { ChartSkeleton, PanelSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div>
      <ChartSkeleton />
      <div className="mt-6">
        <PanelSkeleton rows={4} />
      </div>
    </div>
  );
}