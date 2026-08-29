'use client';

import { useEffect, useRef, useState } from 'react';
import { StopIcon, TopIcon } from '@/assets/icons';
import { RegisterModal } from '@/components/register-modal/register-modal';
import { useUserStore } from '@/store/zustand';
import { Sidebar } from '@/components/sidebar/sidebar';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { GetChats } from '@/firebase/chats/firestore-action';

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string };

export default function Home() {

  const userStore = useUserStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const roomIdRef = useRef<string>('');
  const [loginModal, setLoginModal] = useState(false);
  const [signupModal, setSignupModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  const params = useSearchParams();

  const roomId = params.get('roomId');

  useEffect(() => {
    if (roomId) {
      const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId;
      roomIdRef.current = roomIdStr;

      (async () => {

        fetch(`/api/chat/${roomIdStr}`)
          .then((res) => res.json())
          .then((response) => {

            const loaded: Message[] = response.data?.map((chat: any) => ({
              role: chat.messages.role,
              content: chat.messages.content,
            })) || [];
            
            setMessages(loaded);
          });

      })();
    } else {
      roomIdRef.current = '';
      setMessages([]);
    }
  }, [roomId]);

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
          userId: userStore.userData._id,
          roomId: roomIdRef.current || undefined
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      const roomId = res.headers.get('X-Room-Id');
      if (roomId) {
        roomIdRef.current = roomId;
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
    router.replace('/');
    setMessages([]);
    roomIdRef.current = '';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const handleLogIn = () => {
    setLoginModal(true);
  }

  const handleSignUp = () => {
    setSignupModal(true);
  }

  const onCloseModal = () => {
    setLoginModal(false);
    setSignupModal(false);
  }

  const handleLogOut = () => {
    userStore.setUserData({
      firstName: "",
      lastName: "",
      email: "",
      _id: ""
    });
  }

  useEffect(() => {
    setTimeout(() => {
      if (userStore.userData._id) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }, 50);
  }, [userStore.userData._id])

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      className="mx-auto flex w-full max-w-3xl items-end gap-2 relative bg-zinc-900 rounded-3xl p-2"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask anything"
        className="max-h-40 resize-none px-4 py-2.5 text-sm outline-none flex-1"
      />
      {isLoading ? (
        <button
          type="button"
          onClick={stopGenerating}
          className="absolute right-2 top-2 rounded-full p-2.5 text-sm font-medium  transition disabled:cursor-not-allowed disabled:opacity-40 bg-accent text-white hover:bg-zinc-300"
        >
          <StopIcon />
        </button>
      ) : (
        <div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-2 rounded-full p-2.5 text-sm font-medium  transition disabled:cursor-not-allowed disabled:opacity-40 bg-accent text-white hover:bg-zinc-300"
          >
            <TopIcon />
          </button>
        </div>
      )}
    </form>
  )
console.log(!(!!roomId));
  return (
    <div className="flex h-dvh flex-col  text-zinc-100 pb-4 pt-1 relative">
      <header className="flex items-center justify-end gap-x-2">
        {
          isLoggedIn !== null && (isLoggedIn ? <button onClick={() => handleLogOut()} className=' bg-zinc-100 text-black p-2.5 rounded-4xl hover:bg-zinc-300 transition-all cursor-pointer'>Log out</button>
            :
            <>
              <button onClick={() => handleLogIn()} className=' bg-zinc-100 text-black p-2.5 rounded-4xl hover:bg-zinc-300 transition-all cursor-pointer'>Log in</button>
              <button onClick={() => handleSignUp()} className='border border-zinc-400 bg-zinc-800 text-white p-2.5 rounded-4xl hover:bg-zinc-600 transition-all cursor-pointer'>Sign up for free</button>
            </>
          )
        }

      </header>
      <Sidebar onClickNewChat={newChat} />
      <main className="flex-1 overflow-y-auto ">

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 && !(!!roomId) && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <h2 className="text-2xl font-semibold">How can I help you today?</h2>
              {form}
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
                    ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 bg-accent text-white opacity-95'
                    : 'max-w-[85%] whitespace-pre-wrap px-4 py-2.5'
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

      {messages.length !== 0 && form}
      {
        loginModal && <RegisterModal mode="login" onCloseModal={onCloseModal} />
      }
      {
        signupModal && <RegisterModal mode="signup" onCloseModal={onCloseModal} />
      }
    </div>
  );
}
