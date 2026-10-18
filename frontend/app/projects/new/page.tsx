import DashboardLayout from "@/components/DashboardLayout";
import ProjectForm from "@/components/ProjectForm";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <DashboardLayout role="ceo" title="Add project" subtitle="Create a new project">
      <ProjectForm action={createProject} submitLabel="Create project" />
    </DashboardLayout>
  );
}