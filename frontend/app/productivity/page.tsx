import DashboardLayout from "@/components/DashboardLayout";
import ChartWidget from "@/components/ChartWidget";
import { fetchProductivity, fetchWorkload } from "@/lib/api";

const statusColor = {
  "On track": "text-[#3FA77C]", "At risk": "text-[#C9A227]", "Not started": "text-[#8B93A7]",
};

export default async function ProductivityPage() {
  const [productivity, workload] = await Promise.all([fetchProductivity(), fetchWorkload()]);

  return (
    <DashboardLayout role="ceo" title="Team Productivity Analysis" subtitle="Task completion and workload across teams">
      <ChartWidget
        title="Task Completion Rate by Team" subtitle="% of assigned tasks, this sprint"
        type="bar" data={productivity} xKey="team"
        series={[
          { key: "completed", label: "Completed", color: "#C9A227" },
          { key: "pending", label: "Pending", color: "#242B3D" },
        ]}
      />

      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D]">
          <h3 className="text-sm font-semibold text-[#E7E4DC]">Workload & Deadlines</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {workload.map((w) => (
              <tr key={w.task} className="border-b border-[#242B3D] last:border-0">
                <td className="px-5 py-3 text-[#E7E4DC]">{w.member}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{w.task}</td>
                <td className="px-5 py-3 text-[#8B93A7]">{w.due}</td>
                <td className={`px-5 py-3 font-medium ${statusColor[w.status]}`}>{w.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}