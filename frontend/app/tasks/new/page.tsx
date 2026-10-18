import DashboardLayout from "@/components/DashboardLayout";
import TaskForm from "@/components/TaskForm";
import { fetchTaskOptions } from "@/lib/tasksApi";
import { createTask } from "../actions";

export default async function NewTaskPage() {
  const options = await fetchTaskOptions();

  return (
    <DashboardLayout role="ceo" title="Add task" subtitle="Create a task and assign it to an employee">
      <TaskForm action={createTask} options={options} submitLabel="Create task" />
    </DashboardLayout>
  );
}