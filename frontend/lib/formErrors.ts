import type { SaveState } from "./userTypes";

// Turns a failed backend answer into the error state a form shows.
// Passwords are never sent back to the page.
export async function failedState(
  res: Response,
  values: Record<string, string>
): Promise<NonNullable<SaveState>> {
  const safe: Record<string, string> = {};
  for (const [key, val] of Object.entries(values)) {
    if (!key.includes("password")) safe[key] = val;
  }

  if (res.status === 403 || res.status === 404) {
    return { error: "You are not allowed to do this.", fieldErrors: {}, values: safe, saved: false };
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
  return { error, fieldErrors, values: safe, saved: false };
}