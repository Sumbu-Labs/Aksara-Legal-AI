'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PermitDefinition } from '@/data/permits';

type Citation = {
  url?: string;
  title?: string;
  section?: string;
  snippet?: string;
};

type QaResponse = {
  answer_md: string;
  citations: Citation[];
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'pending' | 'complete' | 'error';
  createdAt: number;
  citations?: Citation[];
};

function getEnv(name: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  if (typeof window !== 'undefined') {
    const fromWindow = (window as unknown as Record<string, string | undefined>)[name];
    if (fromWindow) return fromWindow;
  }
  return fallback;
}

function createMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderAssistantHtml(content: string): string {
  const safe = escapeHtml(content.trim());
  if (!safe) {
    return '<p class="text-neutral-mid">AI sedang menyiapkan jawaban...</p>';
  }

  const codeBlocks: string[] = [];
  let withPlaceholders = safe.replace(/```([\s\S]*?)```/g, (_match, code) => {
    const index = codeBlocks.push(`<pre class="mt-2 overflow-x-auto rounded-md border border-neutral-light bg-white/80 p-3 text-xs text-neutral-dark"><code>${code}</code></pre>`) - 1;
    return `@@CODE_BLOCK_${index}@@`;
  });

  withPlaceholders = withPlaceholders
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-secondary/60 px-1 py-[1px]">$1</code>');

  withPlaceholders = withPlaceholders
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br />');

  let html = `<p>${withPlaceholders}</p>`;

  codeBlocks.forEach((block, index) => {
    html = html.replace(`@@CODE_BLOCK_${index}@@`, block);
  });

  return html;
}

type ChatPanelProps = {
  permit: PermitDefinition;
};

export default function ChatPanel({ permit }: ChatPanelProps) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const aiServiceUrl = useMemo(
    () => getEnv('NEXT_PUBLIC_AI_SERVICE_URL', 'http://localhost:8000'),
    [],
  );
  const userId = useMemo(() => getEnv('NEXT_PUBLIC_MOCK_USER_ID', 'demo-user'), []);
  const bearerToken = useMemo(() => getEnv('NEXT_PUBLIC_AI_SERVICE_TOKEN', ''), []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!messageContainerRef.current) {
      return;
    }
    messageContainerRef.current.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) {
      return;
    }

    setBannerMessage(null);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmed,
      status: 'complete',
      createdAt: Date.now(),
    };

    const assistantId = createMessageId();
    const placeholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: 'pending',
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, placeholder]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch(`${aiServiceUrl}/v1/qa/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
        body: JSON.stringify({
          question: trimmed,
          permit_type: permit.permitType,
          region: permit.region,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      const data: QaResponse = await response.json();

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: data.answer_md,
                citations: data.citations,
                status: 'complete',
                createdAt: Date.now(),
              }
            : message,
        ),
      );
    } catch (error) {
      console.error('chat_send_failed', error);
      setBannerMessage(
        'Tidak dapat menghubungi layanan AI. Pastikan layanan AI berjalan dan coba lagi.',
      );
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  'Maaf, kami tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi dalam beberapa saat.',
                status: 'error',
                createdAt: Date.now(),
              }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }, [aiServiceUrl, bearerToken, inputValue, isSending, permit.permitType, permit.region, userId]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const canSend = inputValue.trim().length > 0 && !isSending;

  return (
    <section className='flex flex-col gap-4 rounded-xl border-2 border-neutral-light bg-white p-6 shadow-[var(--box-shadow-card)]'>
      <header className='flex flex-col gap-2 border-b-2 border-neutral-light pb-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='font-heading text-2xl text-neutral-dark'>Percakapan dengan AI</h2>
          <p className='text-sm text-neutral-mid'>Ajukan pertanyaan spesifik tentang {permit.name}.</p>
        </div>
        <span className='self-start rounded-full border-2 border-neutral-light bg-secondary/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neutral-mid'>
          Respon Real-time
        </span>
      </header>

      <div
        ref={messageContainerRef}
        className='h-[420px] overflow-y-auto rounded-lg border-2 border-neutral-light bg-secondary/20 p-4'
      >
        {messages.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center gap-3 text-center text-neutral-mid'>
            <p className='font-semibold text-neutral-dark'>Mulai percakapan</p>
            <p className='max-w-sm text-sm'>Gunakan salah satu rekomendasi pertanyaan atau ketik kendala perizinan yang Anda hadapi.</p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const bubbleClasses = isUser
                ? 'bg-primary text-white border-black'
                : message.status === 'error'
                  ? 'bg-[var(--color-danger)]/10 text-neutral-dark border-[var(--color-danger)]'
                  : 'bg-white text-neutral-dark border-neutral-light';

              const bodyHtml = isUser
                ? `<p>${escapeHtml(message.content).replace(/\n/g, '<br />')}</p>`
                : renderAssistantHtml(message.content);

              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl border-2 px-4 py-3 shadow-[var(--box-shadow-card)] ${bubbleClasses}`}>
                    <div className='text-sm leading-relaxed' dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                    <div className='mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-neutral-mid'>
                      <span>{isUser ? 'Pengguna' : 'Aksara AI'}</span>
                      <span>{formatTimestamp(message.createdAt)}</span>
                    </div>
                    {!isUser && message.status === 'pending' ? (
                      <p className='mt-3 text-xs italic text-neutral-mid'>AI sedang menyiapkan jawaban...</p>
                    ) : null}
                    {!isUser && message.citations && message.citations.length > 0 ? (
                      <div className='mt-3 rounded-md border border-neutral-light bg-secondary/30 p-3'>
                        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-neutral-mid'>Referensi</p>
                        <ul className='mt-2 space-y-2 text-xs text-neutral-dark'>
                          {message.citations.map((citation, index) => (
                            <li key={`${message.id}-citation-${index}`}>
                              <a
                                href={citation.url ?? '#'}
                                className='font-semibold text-primary underline-offset-2 hover:underline'
                                target={citation.url ? '_blank' : undefined}
                                rel={citation.url ? 'noopener noreferrer' : undefined}
                              >
                                {citation.title ?? citation.url ?? `Sumber ${index + 1}`}
                              </a>
                              {citation.section ? (
                                <span className='block text-neutral-mid'>Bagian: {citation.section}</span>
                              ) : null}
                              {citation.snippet ? (
                                <span className='mt-1 block text-neutral-mid'>{citation.snippet}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {bannerMessage ? (
        <div className='rounded-lg border-2 border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-neutral-dark'>
          {bannerMessage}
        </div>
      ) : null}

      <div className='flex flex-wrap gap-2'>
        {permit.samplePrompts.map((prompt) => (
          <button
            key={prompt}
            type='button'
            onClick={() => handleSuggestion(prompt)}
            className='rounded-full border-2 border-neutral-light bg-secondary/30 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-mid transition-colors hover:border-primary hover:text-primary'
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className='flex flex-col gap-3 rounded-lg border-2 border-neutral-light bg-secondary/30 p-4'>
        <label className='text-xs font-semibold uppercase tracking-[0.3em] text-neutral-mid' htmlFor='chat-input'>
          Tulis Pertanyaan Anda
        </label>
        <textarea
          id='chat-input'
          ref={textareaRef}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className='w-full resize-none border-2 border-neutral-light bg-white px-3 py-3 text-sm text-neutral-dark focus:border-primary focus:outline-none'
          placeholder={`Contoh: ${permit.samplePrompts[0]}`}
        />
        <div className='flex flex-col gap-2 text-xs text-neutral-mid md:flex-row md:items-center md:justify-between'>
          <p>Tekan Enter untuk kirim, Shift + Enter untuk baris baru.</p>
          <button
            type='button'
            onClick={() => void handleSend()}
            disabled={!canSend}
            className='flex items-center justify-center gap-2 border-2 border-black bg-primary px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:border-neutral-light disabled:bg-neutral-light disabled:text-neutral-mid'
          >
            {isSending ? 'Mengirim...' : 'Kirim Pesan'}
          </button>
        </div>
      </div>
    </section>
  );
}
