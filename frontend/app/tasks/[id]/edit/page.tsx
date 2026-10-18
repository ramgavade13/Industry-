import { notFound } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";
import { fetchTask, fetchTaskOptions } from "@/lib/tasksApi";
import { updateTask } from "../../actions";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, options] = await Promise.all([fetchTask(id), fetchTaskOptions()]);
  if (!task) notFound();

  return (
    <DashboardLayout role="ceo" title="Edit task" subtitle={task.task}>
      <TaskForm
        action={updateTask.bind(null, task.id)}
        options={options}
        task={task}
        submitLabel="Save changes"
      />
    </DashboardLayout>
  );
}