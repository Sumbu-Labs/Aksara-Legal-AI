"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "pending" | "complete" | "error";
  createdAt: number;
};

type ChatToolbarProps = {
  suggestions?: string[];
};

function getEnv(name: string, fallback: string): string {
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name] as string;
  }
  if (typeof window !== "undefined") {
    const fromWindow = (window as unknown as Record<string, string | undefined>)[name];
    if (fromWindow) {
      return fromWindow;
    }
  }
  return fallback;
}

function createMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderAssistantHtml(content: string): string {
  const safe = escapeHtml(content.trim());
  if (!safe) {
    return "<p class=\"text-neutral-mid\">AI sedang menyiapkan jawaban...</p>";
  }

  const codeBlocks: string[] = [];
  let withPlaceholders = safe.replace(/```([\s\S]*?)```/g, (_match, code) => {
    const index = codeBlocks.push(
      `<pre class=\"mt-2 overflow-x-auto rounded-md border border-neutral-light bg-white/80 p-3 text-xs text-neutral-dark\"><code>${code}</code></pre>`,
    ) - 1;
    return `@@CODE_BLOCK_${index}@@`;
  });

  withPlaceholders = withPlaceholders
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-secondary/60 px-1 py-[1px]">$1</code>');

  withPlaceholders = withPlaceholders
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br />");

  let html = `<p>${withPlaceholders}</p>`;
  codeBlocks.forEach((block, index) => {
    html = html.replace(`@@CODE_BLOCK_${index}@@`, block);
  });
  return html;
}

export default function ChatToolbar({ suggestions = [] }: ChatToolbarProps) {
  const backendBaseUrl = useMemo(
    () => getEnv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:7600"),
    [],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setErrorBanner(null);
  }, []);

  const pushUserMessage = useCallback((content: string) => {
    const message: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content,
      status: "complete",
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
    return message.id;
  }, []);

  const pushAssistantPlaceholder = useCallback(() => {
    const message: ChatMessage = {
      id: createMessageId(),
      role: "assistant",
      content: "",
      status: "pending",
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
    return message.id;
  }, []);

  const updateAssistantMessage = useCallback((id: string, payload: { content: string; status: ChatMessage["status"] }) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id
          ? {
              ...message,
              content: payload.content,
              status: payload.status,
              createdAt: payload.status === "pending" ? message.createdAt : Date.now(),
            }
          : message,
      ),
    );
  }, []);

  const handleSend = useCallback(
    async (prompt?: string) => {
      const finalPrompt = (prompt ?? inputValue).trim();
      if (!finalPrompt || isSending) {
        return;
      }
      setInputValue("");
      setErrorBanner(null);
      setIsSending(true);
      pushUserMessage(finalPrompt);
      const assistantMessageId = pushAssistantPlaceholder();

      try {
        const response = await fetch(`${backendBaseUrl}/api/ask`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: finalPrompt,
            permitType: null,
            region: "DIY",
          }),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Gagal menghubungi AI");
        }

        const data = (await response.json()) as { answer_md: string };
        updateAssistantMessage(assistantMessageId, {
          content: data.answer_md,
          status: "complete",
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim pesan.";
        setErrorBanner(message);
        updateAssistantMessage(assistantMessageId, {
          content: message,
          status: "error",
        });
      } finally {
        setIsSending(false);
      }

      // Focus back to textarea for quick follow ups
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
    [backendBaseUrl, isSending, inputValue, pushAssistantPlaceholder, pushUserMessage, updateAssistantMessage],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="pointer-events-none">
      <div className="pointer-events-auto fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-primary text-white shadow-lg transition-transform hover:scale-105"
          aria-label={isOpen ? "Tutup Chatbot" : "Buka Chatbot"}
        >
          {isOpen ? "×" : "AI"}
        </button>

        {isOpen ? (
          <section className="w-[360px] rounded-xl border-2 border-black bg-white shadow-[var(--box-shadow-card)]">
            <header className="flex items-start justify-between gap-3 border-b-2 border-black bg-secondary/40 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Aksara Copilot</p>
                <p className="text-sm text-neutral-mid">Tanyakan langkah berikutnya kapan pun.</p>
              </div>
            </header>

            <div ref={containerRef} className="max-h-[340px] overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-neutral-mid">
                  <p className="font-semibold text-neutral-dark">Mulai percakapan</p>
                  <p className="text-sm">Tanyakan prioritas tugas atau minta klarifikasi dokumen.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((message) => {
                    const isUser = message.role === "user";
                    const bubbleClasses = isUser
                      ? "bg-primary text-white border-black"
                      : message.status === "error"
                        ? "border-[var(--color-danger)] bg-[var(--color-danger)]/10 text-neutral-dark"
                        : "border-neutral-light bg-secondary/30 text-neutral-dark";
                    const bodyHtml = isUser
                      ? `<p>${escapeHtml(message.content).replace(/\n/g, '<br />')}</p>`
                      : renderAssistantHtml(message.content);
                    return (
                      <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl border-2 px-4 py-3 text-sm shadow-[var(--box-shadow-card)] ${bubbleClasses}`}>
                          <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-neutral-mid">
                            <span>{isUser ? "Anda" : "Aksara AI"}</span>
                            <span>{formatTimestamp(message.createdAt)}</span>
                          </div>
                          {!isUser && message.status === "pending" ? (
                            <p className="mt-2 text-xs italic text-neutral-mid">AI sedang memikirkan jawaban...</p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {errorBanner ? (
              <div className="mx-4 mb-3 rounded-md border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-xs text-neutral-dark">
                {errorBanner}
              </div>
            ) : null}

            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void handleSend(suggestion)}
                    className="rounded-full border border-neutral-light bg-secondary/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-mid transition-colors hover:border-primary hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="border-t border-neutral-light px-4 py-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Tulis pertanyaan Anda..."
                className="w-full resize-none rounded-lg border-2 border-neutral-light bg-white px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-mid">
                <span>Enter untuk kirim • Shift+Enter untuk baris baru</span>
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={isSending || inputValue.trim().length === 0}
                  className="flex items-center gap-2 rounded-full border-2 border-black bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:border-neutral-light disabled:bg-neutral-light disabled:text-neutral-mid"
                >
                  {isSending ? "Mengirim..." : "Kirim"}
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

