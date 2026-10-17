import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartWidget from "@/components/ChartWidget";
import { fetchExecutiveAnalysis } from "@/lib/api";

export default async function CeoDashboardPage() {
  const data = await fetchExecutiveAnalysis();

  // --------------------------------
  // Financial data
  // --------------------------------

  const financialAnalysis = data.financial_report.analysis as any;

const revenue = Number(financialAnalysis.total_revenue) || 0;
const expenses = Number(financialAnalysis.total_expenses) || 0;
const profit = Number(financialAnalysis.total_profit) || 0;
const margin = Number(financialAnalysis.profit_margin_percent) || 0;
  // --------------------------------
  // Risk data
  // --------------------------------

  const totalRisks =
    data.project_risk_report.high_risk_projects +
    data.project_risk_report.medium_risk_projects;

  // --------------------------------
  // KPI cards
  // --------------------------------

  const kpis = [
    {
      label: "Total Revenue",
      value: `₹${(revenue / 100000).toFixed(1)}L`,
      change: `${margin.toFixed(1)}% margin`,
      trend: "up" as const,
    },
    {
      label: "Total Expenses",
      value: `₹${(expenses / 100000).toFixed(1)}L`,
      change: "Recorded",
      trend: "down" as const,
    },
    {
      label: "Projects Analyzed",
      value: String(data.project_risk_report.total_projects_analyzed),
      change: `${data.project_risk_report.high_risk_projects} high risk`,
      trend: "up" as const,
    },
    {
      label: "Risk Alerts",
      value: String(totalRisks),
      change: data.attention_level.level,
      trend:
        data.attention_level.level === "HIGH"
          ? ("down" as const)
          : ("up" as const),
    },
  ];

  // --------------------------------
  // Risk chart
  // --------------------------------

  const riskChart = [
    {
      type: "High",
      count: data.project_risk_report.high_risk_projects,
    },
    {
      type: "Medium",
      count: data.project_risk_report.medium_risk_projects,
    },
    {
      type: "Low",
      count: data.project_risk_report.low_risk_projects,
    },
  ];

  // --------------------------------
  // Financial chart
  // --------------------------------

  const financialChart = [
    {
      type: "Financials",
      revenue: Number((revenue / 100000).toFixed(2)),
      expenses: Number((expenses / 100000).toFixed(2)),
      profit: Number((profit / 100000).toFixed(2)),
    },
  ];

  return (
    <DashboardLayout
      role="ceo"
      title="CEO Dashboard"
      subtitle="AI-powered executive business analysis"
    >
      {/* KPI CARDS */}
      <div
        data-animate-in
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ChartWidget
            title="Financial Overview"
            subtitle="Recorded revenue, expenses and profit"
            type="bar"
            data={financialChart}
            xKey="type"
            series={[
              {
                key: "revenue",
                label: "Revenue",
                color: "#C9A227",
              },
              {
                key: "expenses",
                label: "Expenses",
                color: "#8B93A7",
              },
              {
                key: "profit",
                label: "Profit",
                color: "#3FA77C",
              },
            ]}
          />
        </div>

        <ChartWidget
          title="Project Risk"
          subtitle="Risk distribution"
          type="bar"
          data={riskChart}
          xKey="type"
          series={[
            {
              key: "count",
              label: "Projects",
              color: "#D65F5F",
            },
          ]}
        />
      </div>

      {/* SUMMARY + RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* EXECUTIVE SUMMARY */}
        <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5">
          <h3 className="text-sm font-semibold text-[#E7E4DC] mb-4">
            Executive Summary
          </h3>

          <p className="text-sm leading-6 text-[#8B93A7]">
            {data.executive_summary}
          </p>

          <div className="mt-4">
            <span className="text-xs text-[#8B93A7]">
              Attention Level
            </span>

            <div
              className={`mt-1 inline-block ml-2 text-xs font-semibold px-2 py-1 rounded border ${
                data.attention_level.level === "HIGH"
                  ? "bg-[#D65F5F]/15 text-[#D65F5F] border-[#D65F5F]/30"
                  : "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30"
              }`}
            >
              {data.attention_level.level}
            </div>
          </div>
        </div>

        {/* AI RECOMMENDATIONS */}
        <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-5">
          <h3 className="text-sm font-semibold text-[#E7E4DC] mb-4">
            AI Recommendations
          </h3>

          <div className="space-y-3">
{data.recommendation_report.recommendations.map(
  (item, index) => (
    <div
      key={index}
      className="border border-[#242B3D] rounded-md px-3 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[#E7E4DC]">
          {item.area}
        </div>

        <span
          className={`text-[10px] px-2 py-1 rounded border ${
            item.priority === "HIGH"
              ? "bg-[#D65F5F]/15 text-[#D65F5F] border-[#D65F5F]/30"
              : "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30"
          }`}
        >
          {item.priority}
        </span>
      </div>

      <div className="text-sm text-[#E7E4DC] mt-3">
        {item.recommendation}
      </div>

      <div className="text-xs text-[#8B93A7] mt-2">
        Reason: {item.reason}
      </div>
    </div>
  )
)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}