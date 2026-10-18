// Types for the task pages. The form state shape is shared with the project form.

export type TaskRow = {
  id: number;
  task: string;
  member: string;
  assignee: number;
  project: string;
  project_id: number | null;
  due: string;
  due_date: string | null;
  status: string;
  priority: string;
};

export type TaskOptions = {
  employees: { id: number; name: string }[];
  projects: { id: number; name: string }[];
};