import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";

export default function ManagerDashboard() {
  return (
    <DashboardLayout title="Manager Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Team Members"
          value="14"
          description="Members in your team"
        />

        <KPICard
          title="Active Tasks"
          value="32"
          description="Tasks in progress"
        />

        <KPICard
          title="Completed Tasks"
          value="86%"
          description="Task completion rate"
        />

        <KPICard
          title="Projects"
          value="6"
          description="Projects assigned"
        />
      </div>
    </DashboardLayout>
  );
}