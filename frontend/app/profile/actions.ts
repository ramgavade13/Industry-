"use server";

import { revalidatePath } from "next/cache";
import { authFetch } from "@/lib/projectsApi";
import { failedState } from "@/lib/formErrors";
import type { SaveState } from "@/lib/userTypes";

export async function updateProfile(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    first_name: text("first_name"),
    last_name: text("last_name"),
    email: text("email"),
  };

  const res = await authFetch("/api/accounts/me/profile/", {
    method: "PATCH",
    body: JSON.stringify(values),
  });
  if (!res.ok) return failedState(res, values);

  revalidatePath("/profile");
  return { error: "", fieldErrors: {}, values, saved: true };
}

export async function changePassword(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const body = {
    current_password: String(formData.get("current_password") ?? ""),
    new_password: String(formData.get("new_password") ?? ""),
    confirm_password: String(formData.get("confirm_password") ?? ""),
  };

  const res = await authFetch("/api/accounts/me/password/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) return failedState(res, {});

  return { error: "", fieldErrors: {}, values: {}, saved: true };
}