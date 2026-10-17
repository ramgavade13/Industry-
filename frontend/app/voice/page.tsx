"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { askExecutiveAssistant } from "@/lib/chatAssistant";
import { getRole } from "@/lib/auth";
import { getRoleContent } from "@/lib/roleContent";

type Turn = { id: string; question: string; answer: string };
type Status = "idle" | "listening" | "thinking" | "speaking" | "unsupported";

type SpeechResult = { isFinal: boolean; [key: number]: { transcript: string } };
type SpeechEvent = { results: { length: number; [key: number]: SpeechResult } };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const noopSubscribe = () => () => {};

// Remove markdown symbols so the answer is readable and the voice doesn't say "asterisk".
function cleanText(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/[*_#`]/g, "")
    .replace(/^\s*[-•]\s+/gm, "• ")
    .trim();
}

export default function VoicePage() {
  const role = useSyncExternalStore(noopSubscribe, () => getRole(), () => null);
  const content = getRoleContent(role);
  const hints = content.suggestions.slice(0, 2);

  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const heardRef = useRef("");
  // Bumped whenever a new question starts or the user presses Stop.
  // Any answer or speech belonging to an older number is ignored.
  const requestIdRef = useRef(0);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setStatus("unsupported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      const heard = (finalText || interimText).trim();
      heardRef.current = heard;
      setTranscript(heard);
    };

    // Ask only once, when the microphone stops listening.
    recognition.onend = () => {
      const question = heardRef.current.trim();
      heardRef.current = "";
      if (question) handleQuestion(question);
      else setStatus((s) => (s === "listening" ? "idle" : s));
    };

    recognition.onerror = () => {
      heardRef.current = "";
      setStatus("idle");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleQuestion(question: string) {
    const myId = ++requestIdRef.current;
    setStatus("thinking");
    const answer = cleanText(await askExecutiveAssistant(question));
    if (myId !== requestIdRef.current) return; // user pressed Stop or asked again
    setTurns((prev) => [...prev, { id: crypto.randomUUID(), question, answer }]);
    speak(answer, myId);
  }

  function speak(text: string, myId: number) {
    if (!("speechSynthesis" in window)) {
      setStatus("idle");
      return;
    }
    setStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    const finish = () => {
      if (myId === requestIdRef.current) setStatus("idle");
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (!recognitionRef.current) return;
    requestIdRef.current++; // drop anything still pending from before
    window.speechSynthesis?.cancel();
    heardRef.current = "";
    setTranscript("");
    setStatus("listening");
    recognitionRef.current.start();
  }

  function stopAll() {
    requestIdRef.current++; // any answer still on its way will be ignored
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

        {(status === "speaking" || status === "thinking") && (
          <button onClick={stopAll} className="mt-2 text-xs text-[#8B93A7] hover:text-[#D65F5F] transition-colors underline">
            Stop
          </button>
        )}

        {transcript && status !== "idle" && (
          <div className="mt-6 max-w-md text-center text-sm text-[#E7E4DC] bg-[#161C2C] border border-[#242B3D] rounded-lg px-4 py-3">
            &ldquo;{transcript}&rdquo;
          </div>
        )}

        <div className="mt-10 w-full max-w-2xl space-y-4">
          {turns.length === 0 && status !== "unsupported" && hints.length > 0 && (
            <p className="text-center text-xs text-[#5C6580]">
              Try: {hints.map((h, i) => (
                <span key={h}>
                  {i > 0 && " or "}
                  &ldquo;{h}&rdquo;
                </span>
              ))}
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