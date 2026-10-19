"use server";

import { revalidatePath } from "next/cache";
import { authFetch } from "@/lib/projectsApi";
import type { DecisionStatus } from "@/lib/recommendationTypes";

// Saves Accept / Dismiss, or "New" to undo an earlier decision.
export async function setRecommendationStatus(id: string, status: DecisionStatus): Promise<void> {
  await authFetch(`/api/recommendations/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  revalidatePath("/recommendations");
}