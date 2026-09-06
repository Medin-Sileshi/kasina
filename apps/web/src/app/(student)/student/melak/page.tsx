"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MessageCircle, Mic, NotebookPen, Send, Sparkles, Wifi, WifiOff } from "lucide-react";
import { generateMelakReply } from "@kasina/melak-core";
import { apiFetch } from "@/lib/auth-client";
import {
  appendLocalMelakHistory,
  cacheMelakQuestion,
  getCachedMelakQuestion,
  loadLocalMelakHistory,
} from "@/lib/melak-cache";
import { MelakMessageContent } from "@/components/melak-message-content";
import {
  Card,
  ContentSkeleton,
  GhostButton,
  SecondaryButton,
} from "@/components/ui";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  mode?: "offline" | "online";
};

const SUGGESTIONS: Array<{
  label: string;
  prompt: string;
  icon: "bulb" | "notebook" | "help" | "am";
}> = [
  {
    label: "Explain the Power Rule",
    prompt: "Explain the Power Rule",
    icon: "bulb",
  },
  {
    label: "Show worked example",
    prompt: "Show a worked example of the power rule",
    icon: "notebook",
  },
  {
    label: "Why is this formula used?",
    prompt: "Why is the derivative / power rule formula used?",
    icon: "help",
  },
  {
    label: "በአማርኛ አስረዳኝ",
    prompt: "በአማርኛ አስረዳኝ — የኃይል ህግ (power rule) ምንድን ነው?",
    icon: "am",
  },
];

function SuggestionIcon({ kind }: { kind: (typeof SUGGESTIONS)[number]["icon"] }) {
  if (kind === "bulb") {
    return <span aria-hidden className="text-sm leading-none">💡</span>;
  }
  if (kind === "notebook") {
    return <NotebookPen className="h-3.5 w-3.5 text-gray-500" aria-hidden />;
  }
  if (kind === "help") {
    return (
      <span
        aria-hidden
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
      >
        ?
      </span>
    );
  }
  return <span aria-hidden className="text-sm leading-none">🇪🇹</span>;
}

export default function MelakPage() {
  return (
    <Suspense fallback={<ContentSkeleton rows={6} />}>
      <MelakChat />
    </Suspense>
  );
}

function MelakChat() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("q") ?? undefined;
  const sessionId = searchParams.get("session") ?? undefined;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineMode, setOnlineMode] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const local = loadLocalMelakHistory().map((m) => ({
      role: m.role,
      content: m.content,
      mode: m.mode,
    }));

    if (!isOnline) {
      setMessages(local);
      setLoading(false);
      return;
    }

    apiFetch<{ messages: Array<{ role: "user" | "assistant"; content: string }> }>(
      "/melak/history",
    )
      .then((data) => {
        const server = data.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        setMessages(server.length ? server : local);
      })
      .catch(() => setMessages(local))
      .finally(() => setLoading(false));
  }, [isOnline]);

  useEffect(() => {
    if (!questionId || !isOnline) return;
    const cached = getCachedMelakQuestion(questionId);
    if (cached) return;
    apiFetch<{ question: Parameters<typeof cacheMelakQuestion>[0] }>(
      `/melak/context/${questionId}`,
    )
      .then((data) => cacheMelakQuestion(data.question))
      .catch(() => {
        /* offline cache miss — grounded reply needs prior visit */
      });
  }, [questionId, isOnline]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = useCallback(
    async (override?: string) => {
      const text = (override ?? input).trim();
      if (!text || sending) return;
      setInput("");
      setError(null);
      setSending(true);
      const prior = messages;

      const question = getCachedMelakQuestion(questionId);
      const offline = generateMelakReply({ message: text, question });
      const useLocalOnly = !isOnline || !onlineMode;

      if (useLocalOnly) {
        appendLocalMelakHistory(text, offline.reply, "offline");
        setMessages((m) => [
          ...m,
          { role: "user", content: text },
          { role: "assistant", content: offline.reply, mode: "offline" },
        ]);
        setSending(false);
        return;
      }

      setMessages((m) => [...m, { role: "user", content: text }]);

      try {
        const res = await apiFetch<{
          message: string;
          mode: "offline" | "online";
          pilotNote?: string;
        }>("/melak/chat", {
          method: "POST",
          body: JSON.stringify({
            message: text,
            history: prior.slice(-10),
            questionId,
            sessionId,
            online: onlineMode,
          }),
        });
        appendLocalMelakHistory(text, res.message, res.mode);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: res.message, mode: res.mode },
        ]);
        if (onlineMode && res.mode === "offline") {
          setError(
            res.pilotNote ||
              "Enhanced model did not respond in time — showing on-device Melak.",
          );
        } else {
          setError(null);
        }
      } catch (err) {
        appendLocalMelakHistory(text, offline.reply, "offline");
        setMessages((m) => [
          ...m,
          { role: "assistant", content: offline.reply, mode: "offline" },
        ]);
        setError(
          err instanceof Error
            ? err.message
            : "Could not reach Melak — showed on-device reply.",
        );
      } finally {
        setSending(false);
      }
    },
    [
      input,
      sending,
      messages,
      questionId,
      sessionId,
      isOnline,
      onlineMode,
    ],
  );

  if (loading) return <ContentSkeleton rows={6} />;

  return (
    <>
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent-500" />
          <h1 className="text-2xl font-bold text-gray-950">Melak</h1>
          <span lang="am" className="font-ethiopic text-lg text-gray-500">
            መላክ
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-800">
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isOnline
              ? onlineMode
                ? "Enhanced when available"
                : "On-device only"
              : "On-device — no wifi needed"}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Enhanced (online) Melak by default. Falls back to on-device when
          offline or the model is unavailable.
        </p>
        {questionId ? (
          <p className="mt-1 text-xs font-medium text-primary-700">
            {getCachedMelakQuestion(questionId)
              ? "Grounded to your practice question."
              : "Open from a wrong answer once while online to cache this question."}
          </p>
        ) : null}
        {isOnline ? (
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={onlineMode}
              onChange={(e) => setOnlineMode(e.target.checked)}
              className="rounded border-gray-300"
            />
            Use Enhanced (online) when available (falls back to on-device)
          </label>
        ) : null}
      </header>

      <Card className="flex min-h-[420px] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <MessageCircle className="mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-700">
                Ask Melak about Grade 12 Math
              </p>
              <p className="mt-1 max-w-sm text-sm">
                Works offline. Try: &ldquo;Explain the product rule&rdquo; or
                open from a wrong answer for a tailored explanation.
              </p>
            </div>
          ) : null}
          {messages.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary-800 text-white"
                    : "border border-gray-200 bg-gray-50 text-gray-800"
                }`}
              >
                {m.role === "assistant" && m.mode ? (
                  <p
                    className={`mb-1.5 text-[10px] font-bold uppercase tracking-wide ${
                      m.mode === "online"
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  >
                    {m.mode === "offline" ? "On-device" : "Enhanced (online)"}
                  </p>
                ) : null}
                {m.role === "assistant" ? (
                  <MelakMessageContent text={m.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {sending ? (
            <p className="text-sm text-gray-400">
              Melak is thinking
              {onlineMode ? " (enhanced can take up to a minute)…" : "…"}
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="px-4 text-sm text-error-text sm:px-5">{error}</p>
        ) : null}

        <div className="border-t border-gray-100 p-4 sm:p-5">
          <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={sending}
                onClick={() => void send(s.prompt)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <SuggestionIcon kind={s.icon} />
                <span lang={s.icon === "am" ? "am" : undefined}>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/15">
            <span
              className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-gray-600 sm:inline-flex"
              aria-hidden
            >
              <span className="font-serif text-base leading-none text-gray-700">
                Σ
              </span>
              Math
            </span>
            <span
              className="hidden h-5 w-px shrink-0 bg-gray-200 sm:block"
              aria-hidden
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Ask Melak anything in English or Amharic…"
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
              aria-label="Message Melak"
            />
            <button
              type="button"
              disabled
              title="Voice input coming soon"
              aria-label="Voice input coming soon"
              className="inline-flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-gray-400"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={sending || !input.trim()}
              onClick={() => void send()}
              aria-label="Send"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-800 text-white transition hover:bg-primary-700 disabled:opacity-45"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2.5 text-center text-xs text-gray-400">
            Enhanced by default · Grade 12 Math · Not a substitute for your
            teacher
          </p>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/subjects/mathematics">
          <SecondaryButton type="button">Back to practice</SecondaryButton>
        </Link>
        <Link href="/read/mathematics">
          <GhostButton type="button">Open textbook</GhostButton>
        </Link>
      </div>
    </>
  );
}
