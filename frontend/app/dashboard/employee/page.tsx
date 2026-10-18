import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import TaskStatusSelect from "@/components/TaskStatusSelect";
import { fetchEmployeeStats } from "@/lib/api";
import { fetchTasks } from "@/lib/tasksApi";
import { formatDate, priorityColor } from "@/lib/taskStyles";
import { setTaskStatus } from "@/app/tasks/actions";

export default async function EmployeeDashboardPage() {
  const [myStats, myTasks] = await Promise.all([
    fetchEmployeeStats(),
    fetchTasks(),
  ]);

  return (
    <DashboardLayout role="employee" title="My Dashboard" subtitle="Your assigned tasks and deadlines">
      <div data-animate-in className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {myStats.map((s) => <KPICard key={s.label} {...s} />)}
      </div>

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D]">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">My Tasks</h3>
          <p className="text-xs text-[#8B93A7] mt-1">Change the status as you make progress.</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {myTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-[#8B93A7]">
                  You have no tasks assigned.
                </td>
              </tr>
            )}
            {myTasks.map((t) => (
              <tr key={t.id} className="border-b border-[#242B3D] last:border-0">
                <td className="px-5 py-3 text-[#E7E4DC]">
                  {t.task}
                  {t.project && <div className="text-xs text-[#5C6580]">{t.project}</div>}
                </td>
                <td className="px-5 py-3 text-[#8B93A7]">{formatDate(t.due_date)}</td>
                <td className={`px-5 py-3 ${priorityColor[t.priority] ?? "text-[#8B93A7]"}`}>{t.priority}</td>
                <td className="px-5 py-3">
                  <TaskStatusSelect id={t.id} status={t.status} action={setTaskStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}