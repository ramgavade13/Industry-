import { authHeaders } from "@/lib/auth";

export async function askExecutiveAssistant(question: string): Promise<string> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ message: question }),
    });

    if (res.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (!res.ok) {
      return "The assistant could not answer right now. Please try again.";
    }

    const data = await res.json();
    return data.reply ?? "The assistant returned an empty answer.";
  } catch {
    return "Cannot reach the server. Is the backend running?";
  }
}