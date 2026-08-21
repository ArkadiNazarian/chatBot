'use client';

import { useEffect, useRef, useState } from 'react';

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${(error as Error).message}` },
      ]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function stopGenerating() {
    abortRef.current?.abort();
  }

  function newChat() {
    if (isLoading) stopGenerating();
    setMessages([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-sm font-semibold">AI Chat</h1>
        <button
          onClick={newChat}
          className="rounded-md px-3 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          New chat
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-24 text-center">
              <h2 className="text-2xl font-semibold">How can I help you today?</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ask a question below. Responses stream in live.
              </p>
            </div>
          )}

          {messages.map((message, i) => (
            <div
              key={i}
              className={
                message.role === 'user'
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }
            >
              <div
                className={
                  message.role === 'user'
                    ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl bg-zinc-900 px-4 py-2.5 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'max-w-[85%] whitespace-pre-wrap rounded-2xl bg-zinc-100 px-4 py-2.5 dark:bg-zinc-900'
                }
              >
                {message.content ||
                  (message.role === 'assistant' && isLoading ? (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                    </span>
                  ) : null)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="mx-auto flex w-full max-w-3xl items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message AI..."
            className="max-h-40 flex-1 resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stopGenerating}
              className="rounded-2xl bg-zinc-200 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-50 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Send
            </button>
          )}
        </form>
      </footer>
    </div>
  );
}
