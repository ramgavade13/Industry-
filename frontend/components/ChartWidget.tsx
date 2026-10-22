"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Series = { key: string; label: string; color: string };

function normalizeChartColor(color: string): string {
  const map: Record<string, string> = {
    "#C9A227": "#C99400", // Gold / amber brand accent
    "#DDB646": "#D97706",
    "#3FA77C": "#16A34A", // Low / on track green
    "#5FB985": "#15803D",
    "#6C9BD2": "#2563EB", // Executive blue
    "#D65F5F": "#DC2626", // Danger red
    "#8B93A7": "#64748B", // Muted slate
    "#5C6580": "#475569",
    "#0F1420": "#0F172A",
    "#161C2C": "#1E293B",
  };
  return map[color.toUpperCase()] || color;
}

export default function ChartWidget({
  title,
  subtitle,
  type,
  data,
  xKey,
  series,
}: {
  title: string;
  subtitle?: string;
  type: "line" | "bar";
  data: Record<string, string | number>[];
  xKey: string;
  series: Series[];
}) {
  return (
    <div className="card rounded-xl p-5 sm:p-6 bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
      <div className="mb-4">
        <h3 className="text-base font-bold font-display text-ink tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {type === "line" ? (
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fill: "#64748B", fontWeight: 500 }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748B", fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#0F172A", fontWeight: 700, marginBottom: "4px" }}
              itemStyle={{ color: "#334155", fontWeight: 500 }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                color: "#475569",
                paddingTop: "10px",
                fontWeight: 500,
              }}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={normalizeChartColor(s.color)}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 1, stroke: "#FFFFFF" }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fill: "#64748B", fontWeight: 500 }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748B", fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#0F172A", fontWeight: 700, marginBottom: "4px" }}
              itemStyle={{ color: "#334155", fontWeight: 500 }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                color: "#475569",
                paddingTop: "10px",
                fontWeight: 500,
              }}
            />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={normalizeChartColor(s.color)}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
