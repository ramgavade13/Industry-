"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authFetch } from "@/lib/projectsApi";
import type { FormState } from "@/lib/projectTypes";

const FIELDS = [
  "name", "description", "status", "team", "team_size",
  "progress", "budget", "spent", "start_date", "end_date",
];

function readValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const f of FIELDS) values[f] = String(formData.get(f) ?? "").trim();
  return values;
}

// Send the form to the backend. Returns null when it worked, or the errors to show.
async function save(path: string, method: "POST" | "PATCH", formData: FormData): Promise<FormState> {
  const values = readValues(formData);
  const body = {
    name: values.name,
    description: values.description,
    status: values.status || "planning",
    team: values.team,
    team_size: Number(values.team_size || 0),
    progress: Number(values.progress || 0),
    budget: Number(values.budget || 0),
    spent: Number(values.spent || 0),
    start_date: values.start_date || null,
    end_date: values.end_date || null,
  };

  const res = await authFetch(path, { method, body: JSON.stringify(body) });
  if (res.ok) return null;

  if (res.status === 403 || res.status === 404) {
    return { error: "You are not allowed to do this.", fieldErrors: {}, values };
  }

  const fieldErrors: Record<string, string> = {};
  let error = "Please fix the highlighted fields.";
  try {
    const data = await res.json();
    for (const [key, val] of Object.entries(data)) {
      const text = Array.isArray(val) ? val.join(" ") : String(val);
      if (key === "non_field_errors" || key === "detail") error = text;
      else fieldErrors[key] = text;
    }
  } catch {
    error = "Something went wrong. Please try again.";
  }
  return { error, fieldErrors, values };
}

export async function createProject(_prev: FormState, formData: FormData): Promise<FormState> {
  const failed = await save("/api/projects/", "POST", formData);
  if (failed) return failed;
  revalidatePath("/projects");
  redirect("/projects?msg=created");
}

export async function updateProject(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const failed = await save(`/api/projects/${id}/`, "PATCH", formData);
  if (failed) return failed;
  revalidatePath("/projects");
  redirect("/projects?msg=updated");
}

export async function deleteProject(id: number): Promise<void> {
  const res = await authFetch(`/api/projects/${id}/`, { method: "DELETE" });
  revalidatePath("/projects");
  redirect(res.ok ? "/projects?msg=deleted" : "/projects?msg=denied");
}