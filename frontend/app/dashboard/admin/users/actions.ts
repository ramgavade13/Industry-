"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authFetch } from "@/lib/projectsApi";
import { failedState } from "@/lib/formErrors";
import type { SaveState } from "@/lib/userTypes";

function readValues(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    username: text("username"),
    email: text("email"),
    first_name: text("first_name"),
    last_name: text("last_name"),
    role: text("role") || "employee",
    is_active: formData.get("is_active") === "on" ? "on" : "off",
  };
}

export async function createUser(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const values = readValues(formData);
  const password = String(formData.get("password") ?? "");

  const res = await authFetch("/api/accounts/manage/users/", {
    method: "POST",
    body: JSON.stringify({
      username: values.username,
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      role: values.role,
      password,
    }),
  });
  if (!res.ok) return failedState(res, values);

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?msg=created");
}

export async function updateUser(id: number, _prev: SaveState, formData: FormData): Promise<SaveState> {
  const values = readValues(formData);
  const password = String(formData.get("password") ?? "");

  const res = await authFetch(`/api/accounts/manage/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      role: values.role,
      is_active: values.is_active === "on",
      password,
    }),
  });
  if (!res.ok) return failedState(res, values);

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?msg=updated");
}