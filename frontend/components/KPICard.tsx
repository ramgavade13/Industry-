type KPI = { label: string; value: string; change: string; trend: "up" | "down" };

export default function KPICard({ label, value, change, trend }: KPI) {
  const trendColor = trend === "up" ? "text-[#3FA77C]" : "text-[#D65F5F]";
  const arrow = trend === "up" ? "↑" : "↓";
  return (
    <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-4">
      <div className="text-xs text-[#8B93A7]">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[#E7E4DC] tabular-nums">{value}</span>
        {change && (
          <span className={`text-xs font-medium ${trendColor}`}>{arrow} {change}</span>
        )}
      </div>
    </div>
  );
}