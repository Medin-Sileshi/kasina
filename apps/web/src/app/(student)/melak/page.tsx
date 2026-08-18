"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MessageCircle, Send, Sparkles, Wifi, WifiOff } from "lucide-react";
import { generateMelakReply } from "@kasina/melak-core";
import { apiFetch } from "@/lib/auth-client";
import {
  appendLocalMelakHistory,
  cacheMelakQuestion,
  getCachedMelakQuestion,
  loadLocalMelakHistory,
} from "@/lib/melak-cache";
import { MathText } from "@/components/math-text";
import {
  Card,
  ContentSkeleton,
  GhostButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  mode?: "offline" | "online";
};

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
  const [turnsRemaining, setTurnsRemaining] = useState<number | null>(null);
  const [onlineMode, setOnlineMode] = useState(false);
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

  const send = useCallback(async () => {
    const text = input.trim();
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
        turnsRemaining: number;
        mode: "offline" | "online";
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
      setTurnsRemaining(res.turnsRemaining);
    } catch {
      appendLocalMelakHistory(text, offline.reply, "offline");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: offline.reply, mode: "offline" },
      ]);
    } finally {
      setSending(false);
    }
  }, [
    input,
    sending,
    messages,
    questionId,
    sessionId,
    isOnline,
    onlineMode,
  ]);

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
            {isOnline ? "Offline tutor ready" : "Offline — no wifi needed"}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Lightweight Grade 12 Math tutor — runs on your device. Cloud AI is
          optional.
          {turnsRemaining != null ? ` · ${turnsRemaining} syncs left today` : null}
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
            Use cloud tutor when online (uses more data; offline is default)
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
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    {m.mode === "offline" ? "Offline Melak" : "Cloud Melak"}
                  </p>
                ) : null}
                <div className="prose-sm">
                  <MathText text={m.content} />
                </div>
              </div>
            </div>
          ))}
          {sending ? (
            <p className="text-sm text-gray-400">Melak is thinking…</p>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="px-4 text-sm text-error-text sm:px-5">{error}</p>
        ) : null}

        <div className="border-t border-gray-100 p-4 sm:p-5">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder="Ask in English or Amharic…"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <PrimaryButton
              type="button"
              className="h-11 w-11 shrink-0 px-0"
              disabled={sending || !input.trim()}
              onClick={() => void send()}
              aria-label="Send"
            >
              <Send className="mx-auto h-4 w-4" />
            </PrimaryButton>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Offline by default · Grade 12 Math · Not a substitute for your teacher
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
