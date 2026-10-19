import { getFreshAuthHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export type ChatSummary = { id: number; title: string; updated_at: string };
export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

function clean(text: unknown): string {
  return String(text ?? "The assistant returned an empty answer.").replace(/\*\*/g, "");
}

function errorText(status: number): string {
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don't have permission to use the assistant.";
  return "The assistant could not answer right now. Please try again.";
}

// One question, nothing saved (used by the Voice page).
export async function askExecutiveAssistant(question: string): Promise<string> {
  try {
    const res = await fetch(`${API}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getFreshAuthHeaders()) },
      body: JSON.stringify({ message: question }),
    });
    if (!res.ok) return errorText(res.status);
    const data = await res.json();
    return clean(data.reply);
  } catch {
    return "Cannot reach the server. Is the backend running?";
  }
}

// One question inside a saved chat. sessionId is null for a brand new chat;
// the server answers with the id of the chat it saved to.
export async function askInChat(
  question: string,
  sessionId: number | null
): Promise<{ reply: string; sessionId: number | null }> {
  try {
    const res = await fetch(`${API}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getFreshAuthHeaders()) },
      body: JSON.stringify({ message: question, save: true, session_id: sessionId }),
    });
    if (!res.ok) return { reply: errorText(res.status), sessionId };
    const data = await res.json();
    return { reply: clean(data.reply), sessionId: data.session_id ?? sessionId };
  } catch {
    return { reply: "Cannot reach the server. Is the backend running?", sessionId };
  }
}

export async function listChats(): Promise<ChatSummary[]> {
  try {
    const res = await fetch(`${API}/api/chat/sessions/`, {
      headers: { ...(await getFreshAuthHeaders()) },
      cache: "no-store",
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export async function loadChat(id: number): Promise<ChatMessage[] | null> {
  try {
    const res = await fetch(`${API}/api/chat/sessions/${id}/`, {
      headers: { ...(await getFreshAuthHeaders()) },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.messages as { id: number; role: "user" | "assistant"; text: string }[]).map((m) => ({
      id: String(m.id),
      role: m.role,
      text: clean(m.text),
    }));
  } catch {
    return null;
  }
}

export async function deleteChat(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/chat/sessions/${id}/`, {
      method: "DELETE",
      headers: { ...(await getFreshAuthHeaders()) },
    });
    return res.ok;
  } catch {
    return false;
  }
}