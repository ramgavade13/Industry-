// Types shared by the project form (client) and the project actions (server).

export type FormState = {
  error: string;
  fieldErrors: Record<string, string>;
  values: Record<string, string>;
} | null;

export type ProjectDetail = {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  team: string;
  team_size: number;
  budget: number;
  spent: number;
  start_date: string | null;
  end_date: string | null;
};