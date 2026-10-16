"use client";

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

type Series = { key: string; label: string; color: string };

export default function ChartWidget({
  title, subtitle, type, data, xKey, series,
}: {
  title: string;
  subtitle?: string;
  type: "line" | "bar";
  data: Record<string, string | number>[];
  xKey: string;
  series: Series[];
}) {
  return (
    <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#E7E4DC]">{title}</h3>
        {subtitle && <p className="text-xs text-[#8B93A7] mt-0.5">{subtitle}</p>}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid stroke="#242B3D" vertical={false} />
            <XAxis dataKey={xKey} stroke="#5C6580" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#5C6580" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0F1420", border: "1px solid #242B3D", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#E7E4DC" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#8B93A7" }} />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid stroke="#242B3D" vertical={false} />
            <XAxis dataKey={xKey} stroke="#5C6580" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#5C6580" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0F1420", border: "1px solid #242B3D", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#E7E4DC" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#8B93A7" }} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
