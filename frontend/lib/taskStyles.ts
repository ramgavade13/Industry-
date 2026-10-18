export const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed", "Delayed"];
export const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

export const statusColor: Record<string, string> = {
  Completed: "text-[#3FA77C]",
  "In Progress": "text-[#6C9BD2]",
  "Not Started": "text-[#8B93A7]",
  Delayed: "text-[#D65F5F]",
};

export const priorityColor: Record<string, string> = {
  High: "text-[#D65F5F]",
  Medium: "text-[#C9A227]",
  Low: "text-[#8B93A7]",
};

export function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}