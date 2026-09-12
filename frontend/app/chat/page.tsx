"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { askExecutiveAssistant } from "@/lib/chatAssistant";

type Message = { id: string; role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "What are our current risks?",
  "How is revenue trending?",
  "How productive is the team this sprint?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: "Hi, I'm your executive assistant. Ask me about KPIs, revenue, risks, or team productivity." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || thinking) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);

    const reply = await askExecutiveAssistant(question);

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
    setThinking(false);
  }

  return (
    <DashboardLayout role="ceo" title="Executive Chat" subtitle="Ask questions about your business in plain language">
      <div className="flex flex-col h-[calc(100vh-220px)] bg-[#161C2C] border border-[#242B3D] rounded-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 text-sm whitespace-pre-line leading-6 ${
                  m.role === "user"
                    ? "bg-[#C9A227] text-[#0F1420]"
                    : "bg-[#0F1420] border border-[#242B3D] text-[#E7E4DC]"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-[#0F1420] border border-[#242B3D] rounded-lg px-4 py-3 text-sm text-[#8B93A7]">
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

        {messages.length === 1 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs rounded-full border border-[#242B3D] text-[#8B93A7] px-3 py-1.5 hover:border-[#C9A227]/40 hover:text-[#E7E4DC] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-[#242B3D] px-4 py-4 flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about KPIs, revenue, risks, or productivity..."
            className="flex-1 rounded-md border border-[#242B3D] bg-[#0F1420] px-4 py-2.5 text-sm text-[#E7E4DC] outline-none transition-colors focus:border-[#C9A227]"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="rounded-md bg-[#C9A227] text-[#0F1420] text-sm font-semibold px-5 py-2.5 hover:bg-[#DDB646] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}