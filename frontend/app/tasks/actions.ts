"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authFetch } from "@/lib/projectsApi";
import type { FormState } from "@/lib/projectTypes";

const FIELDS = ["task", "assignee", "project", "due_date", "status", "priority"];

function readValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const f of FIELDS) values[f] = String(formData.get(f) ?? "").trim();
  return values;
}

// Send the form to the backend. Returns null when it worked, or the errors to show.
async function save(path: string, method: "POST" | "PATCH", formData: FormData): Promise<FormState> {
  const values = readValues(formData);
  const body = {
    task: values.task,
    assignee: values.assignee ? Number(values.assignee) : null,
    project: values.project ? Number(values.project) : null,
    due_date: values.due_date || null,
    status: values.status || "Not Started",
    priority: values.priority || "Medium",
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

function refresh() {
  revalidatePath("/tasks");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/employee");
}

export async function createTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const failed = await save("/api/tasks/", "POST", formData);
  if (failed) return failed;
  refresh();
  redirect("/tasks?msg=created");
}

export async function updateTask(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const failed = await save(`/api/tasks/${id}/`, "PATCH", formData);
  if (failed) return failed;
  refresh();
  redirect("/tasks?msg=updated");
}

export async function deleteTask(id: number): Promise<void> {
  const res = await authFetch(`/api/tasks/${id}/`, { method: "DELETE" });
  refresh();
  redirect(res.ok ? "/tasks?msg=deleted" : "/tasks?msg=denied");
}

// Used by employees to change the status of their own task.
export async function setTaskStatus(id: number, status: string): Promise<void> {
  await authFetch(`/api/tasks/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) });
  refresh();
}