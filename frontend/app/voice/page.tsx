"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { askExecutiveAssistant } from "@/lib/chatAssistant";

type Turn = { id: string; question: string; answer: string };
type Status = "idle" | "listening" | "thinking" | "speaking" | "unsupported";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoicePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setStatus("unsupported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const said = event.results[0][0].transcript;
      setTranscript(said);
      handleQuestion(said);
    };
    recognition.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
    recognition.onerror = () => setStatus("idle");

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleQuestion(question: string) {
    setStatus("thinking");
    const answer = await askExecutiveAssistant(question);
    setTurns((prev) => [...prev, { id: crypto.randomUUID(), question, answer }]);
    speak(answer);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    setStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => setStatus("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (!recognitionRef.current) return;
    setTranscript("");
    setStatus("listening");
    recognitionRef.current.start();
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }

  const statusLabel: Record<Status, string> = {
    idle: "Tap the mic and ask a question",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    unsupported: "Voice isn't supported in this browser — try Chrome desktop",
  };

  return (
    <DashboardLayout role="ceo" title="Voice Assistant" subtitle="Ask by voice, get a spoken answer back">
      <div className="flex flex-col items-center">
        <button
          onClick={status === "listening" ? undefined : startListening}
          disabled={status === "unsupported" || status === "thinking"}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-semibold transition-colors ${
            status === "listening"
              ? "bg-[#D65F5F] text-white animate-pulse"
              : "bg-[#C9A227] text-[#0F1420] hover:bg-[#DDB646]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          🎙
        </button>

        <p className="mt-4 text-sm text-[#8B93A7]">{statusLabel[status]}</p>

        {status === "speaking" && (
          <button onClick={stopSpeaking} className="mt-2 text-xs text-[#8B93A7] hover:text-[#D65F5F] transition-colors underline">
            Stop speaking
          </button>
        )}

        {transcript && status !== "idle" && (
          <div className="mt-6 max-w-md text-center text-sm text-[#E7E4DC] bg-[#161C2C] border border-[#242B3D] rounded-lg px-4 py-3">
            &ldquo;{transcript}&rdquo;
          </div>
        )}

        <div className="mt-10 w-full max-w-2xl space-y-4">
          {turns.length === 0 && status !== "unsupported" && (
            <p className="text-center text-xs text-[#5C6580]">
              Try: &ldquo;What are our current risks?&rdquo; or &ldquo;How is revenue trending?&rdquo;
            </p>
          )}
          {[...turns].reverse().map((t) => (
            <div key={t.id} className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-5 py-4">
              <div className="text-xs text-[#C9A227] font-medium">You asked</div>
              <p className="text-sm text-[#E7E4DC] mt-1">{t.question}</p>
              <div className="text-xs text-[#C9A227] font-medium mt-3">Assistant</div>
              <p className="text-sm text-[#8B93A7] mt-1 whitespace-pre-line leading-6">{t.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}