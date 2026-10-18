import { notFound } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProjectForm from "@/components/ProjectForm";
import { fetchProject } from "@/lib/projectsApi";
import { updateProject } from "../../actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await fetchProject(id);
  if (!project) notFound();

  return (
    <DashboardLayout role="ceo" title="Edit project" subtitle={project.name}>
      <ProjectForm
        action={updateProject.bind(null, project.id)}
        project={project}
        submitLabel="Save changes"
      />
    </DashboardLayout>
  );
}