import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value="124"
          description="Registered users"
        />

        <KPICard
          title="Employees"
          value="98"
          description="Active employees"
        />

        <KPICard
          title="Managers"
          value="12"
          description="Active managers"
        />

        <KPICard
          title="Projects"
          value="18"
          description="Active projects"
        />
      </div>
    </DashboardLayout>
  );
}