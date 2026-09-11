export const kpiData = [
  { label: "Revenue (MTD)", value: "₹42.6L", change: "+8.2%", trend: "up" as const },
  { label: "Expenses (MTD)", value: "₹18.1L", change: "-3.1%", trend: "down" as const },
  { label: "Active Projects", value: "14", change: "+2", trend: "up" as const },
  { label: "Open Risk Alerts", value: "3", change: "+1", trend: "up" as const },
];

export const revenueTrend = [
  { month: "Apr", revenue: 28, expenses: 19 },
  { month: "May", revenue: 31, expenses: 20 },
  { month: "Jun", revenue: 29, expenses: 21 },
  { month: "Jul", revenue: 35, expenses: 22 },
  { month: "Aug", revenue: 38, expenses: 20 },
  { month: "Sep", revenue: 42.6, expenses: 18.1 },
];

export const riskAlerts = [
  { project: "Client Portal Revamp", risk: "Budget overrun", severity: "high" as const },
  { project: "Inventory Sync API", risk: "Resource shortage", severity: "medium" as const },
  { project: "Mobile App v2", risk: "Deadline slip (5 days)", severity: "low" as const },
];

export const productivityData = [
  { team: "Backend", completed: 82, pending: 18 },
  { team: "Frontend", completed: 74, pending: 26 },
  { team: "AI/ML", completed: 65, pending: 35 },
  { team: "QA", completed: 90, pending: 10 },
];

export const workloadDeadlines = [
  { member: "Gaytri D.", task: "KPI API endpoints", due: "12 Sep", status: "On track" as const },
  { member: "Ram G.", task: "CEO Dashboard UI", due: "14 Sep", status: "On track" as const },
  { member: "Pranav G.", task: "Risk prediction model", due: "18 Sep", status: "At risk" as const },
  { member: "Kirti G.", task: "Report export (PDF)", due: "20 Sep", status: "Not started" as const },
];

// --- Admin role ---
export const systemUsers = [
  { name: "Gaytri Dwase", role: "Admin", status: "Active" as const, lastLogin: "Today" },
  { name: "Ram Gavade", role: "Manager", status: "Active" as const, lastLogin: "Today" },
  { name: "Pranav Gawade", role: "Employee", status: "Active" as const, lastLogin: "Yesterday" },
  { name: "Kirti Genge", role: "Employee", status: "Inactive" as const, lastLogin: "3 days ago" },
];

export const systemStats = [
  { label: "Total Users", value: "24", change: "+3", trend: "up" as const },
  { label: "Active Sessions", value: "9", change: "+1", trend: "up" as const },
  { label: "Modules Live", value: "9 / 10", change: "on track", trend: "up" as const },
  { label: "Pending Approvals", value: "2", change: "-1", trend: "down" as const },
];

// --- Manager role ---
export const teamOverview = [
  { label: "Team Size", value: "6", change: "", trend: "up" as const },
  { label: "Tasks Completed", value: "82%", change: "+5%", trend: "up" as const },
  { label: "Open Blockers", value: "1", change: "-1", trend: "down" as const },
  { label: "Sprint Deadline", value: "3 days", change: "", trend: "down" as const },
];

export const teamTasks = [
  { member: "A. Sharma", task: "API integration testing", due: "13 Sep", status: "On track" as const },
  { member: "N. Patil", task: "Dashboard UI polish", due: "14 Sep", status: "On track" as const },
  { member: "S. Verma", task: "Risk model tuning", due: "16 Sep", status: "At risk" as const },
];

// --- Employee role ---
export const myTasks = [
  { task: "Build KPI Card component", due: "12 Sep", status: "On track" as const },
  { task: "Connect dashboard to mock data", due: "13 Sep", status: "On track" as const },
  { task: "Fix chart responsiveness on mobile", due: "15 Sep", status: "Not started" as const },
];

export const myStats = [
  { label: "Tasks Assigned", value: "5", change: "", trend: "up" as const },
  { label: "Completed", value: "3", change: "", trend: "up" as const },
  { label: "Due This Week", value: "2", change: "", trend: "down" as const },
];
