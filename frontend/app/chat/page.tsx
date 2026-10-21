"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  askInChat,
  deleteChat,
  listChats,
  loadChat,
  type ChatMessage,
  type ChatSummary,
} from "@/lib/chatAssistant";
import { getRole } from "@/lib/auth";
import { getRoleContent } from "@/lib/roleContent";

const noopSubscribe = () => () => {};

export default function ChatPage() {
  // The real role comes from the login cookie (null during the first server render).
  const role = useSyncExternalStore(noopSubscribe, () => getRole(), () => null);
  const content = getRoleContent(role);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [opening, setOpening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    listChats().then((list) => {
      if (!cancelled) setChats(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function refreshChats() {
    setChats(await listChats());
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || thinking || opening) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: question }]);
    setInput("");
    setThinking(true);

    const result = await askInChat(question, activeId);

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: result.reply }]);
    if (result.sessionId !== null) setActiveId(result.sessionId);
    setThinking(false);
    refreshChats();
  }

  function newChat() {
    if (thinking) return;
    setActiveId(null);
    setMessages([]);
    setInput("");
  }

  async function openChat(id: number) {
    if (thinking || opening || id === activeId) return;
    setOpening(true);
    const loaded = await loadChat(id);
    if (loaded) {
      setMessages(loaded);
      setActiveId(id);
    } else {
      refreshChats();
    }
    setOpening(false);
  }

  async function removeChat(id: number) {
    if (!window.confirm("Delete this chat? This cannot be undone.")) return;
    if (await deleteChat(id)) {
      if (id === activeId) {
        setActiveId(null);
        setMessages([]);
      }
      refreshChats();
    }
  }

  return (
    <DashboardLayout role="ceo" title={content.title} subtitle={content.subtitle}>
      <div className="flex h-[calc(100vh-220px)] gap-4">
        {/* Past chats */}
        <aside className="card hidden md:flex w-60 shrink-0 flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <button
              onClick={newChat}
              disabled={thinking}
              className="w-full rounded-xl border border-brand text-brand text-sm font-semibold py-2 hover:bg-brand-subtle transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              + New chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.length === 0 && (
              <p className="px-2 py-3 text-xs text-muted">No saved chats yet. Ask a question to start one.</p>
            )}
            {chats.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-1 rounded-lg px-2 py-2 text-sm cursor-pointer transition-colors ${
                  c.id === activeId
                    ? "bg-brand-subtle text-ink border border-brand/40"
                    : "text-muted border border-transparent hover:bg-surface-subtle hover:text-ink"
                }`}
                onClick={() => openChat(c.id)}
              >
                <span className="flex-1 truncate" title={c.title}>{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeChat(c.id); }}
                  aria-label="Delete chat"
                  className="text-xs text-muted/70 hover:text-danger opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Conversation */}
        <div className="card flex flex-1 min-w-0 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-surface-subtle/60">
            {/* Welcome message, chosen by role */}
            {activeId === null && (
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-6 bg-surface border border-border text-ink shadow-sm">
                  {content.welcome}
                </div>
              </div>
            )}

            {opening && <p className="text-xs text-muted">Loading chat…</p>}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-6 shadow-sm ${
                    m.role === "user"
                      ? "bg-brand text-ink font-medium"
                      : "bg-surface border border-border text-ink"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-muted shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:0ms]">•</span>
                    <span className="animate-bounce [animation-delay:150ms]">•</span>
                    <span className="animate-bounce [animation-delay:300ms]">•</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 0 && !opening && content.suggestions.length > 0 && (
            <div className="px-6 py-3 flex flex-wrap gap-2 border-t border-border bg-surface">
              {content.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs rounded-full border border-border bg-surface text-muted px-3 py-1.5 hover:border-brand/40 hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border bg-surface px-4 py-4 flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={content.placeholder}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="submit"
              disabled={thinking || opening || !input.trim()}
              className="btn-brand rounded-xl text-sm font-semibold px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}