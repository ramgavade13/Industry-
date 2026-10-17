import { getFreshAuthHeaders } from "@/lib/auth";

export async function askExecutiveAssistant(question: string): Promise<string> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getFreshAuthHeaders()) },
      body: JSON.stringify({ message: question }),
    });

    if (res.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (res.status === 403) {
      return "You don't have permission to use the assistant.";
    }
    if (!res.ok) {
      return "The assistant could not answer right now. Please try again.";
    }

    const data = await res.json();
    return String(data.reply ?? "The assistant returned an empty answer.").replace(/\*\*/g, "");
  } catch {
    return "Cannot reach the server. Is the backend running?";
  }
}