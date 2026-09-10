import ChartWidget from "@/components/ChartWidget";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { kpiData, revenueData } from "@/data/mockData";

export default function CEODashboard() {
  return (
    <DashboardLayout title="CEO Dashboard">
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            description={kpi.description}
          />
        ))}
      </section>

      <section className="mt-8">
        <ChartWidget data={revenueData} />
      </section>
    </DashboardLayout>
  );
}