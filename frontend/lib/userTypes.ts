export type ManagedUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
};

// Result of a form submit. `saved` is true after a successful save that stays on the page.
export type SaveState = {
  error: string;
  fieldErrors: Record<string, string>;
  values: Record<string, string>;
  saved: boolean;
} | null;

export type TeamRow = {
  team: string;
  projects: string[];
  project_count: number;
  member_count: number;
  tasks_total: number;
  tasks_completed: number;
  tasks_delayed: number;
  completion_rate: number;
  members: { id: number; name: string; tasks: number; completed: number; delayed: number }[];
};

export const ROLE_OPTIONS = [
  { value: "ceo", label: "CEO" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

export const ROLE_LABEL: Record<string, string> = {
  ceo: "CEO",
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export function formatDateTime(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}