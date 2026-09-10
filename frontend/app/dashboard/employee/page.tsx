import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";

export default function EmployeeDashboard() {
  return (
    <DashboardLayout title="Employee Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="My Tasks"
          value="8"
          description="Tasks assigned to you"
        />

        <KPICard
          title="Completed"
          value="6"
          description="Tasks completed"
        />

        <KPICard
          title="Productivity"
          value="87%"
          description="Current productivity"
        />
      </div>
    </DashboardLayout>
  );
}