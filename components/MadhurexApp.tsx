"use client";

import {
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AvatarScene from "./AvatarScene";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { useSpeech } from "@/hooks/useSpeech";
import { createId } from "@/lib/utils";
import type { Chat, ChatMessage as Message } from "@/lib/types";

function createChat(): Chat {
  return {
    id: createId(),
    title: "New conversation",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export default function MadhurexApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    listening,
    speaking,
    startListening,
    stopSpeaking,
    speak,
  } = useSpeech();

  useEffect(() => {
    const stored = localStorage.getItem("madhurex-chats");

    if (stored) {
      const parsed = JSON.parse(stored) as Chat[];
      setChats(parsed);
      setActiveId(parsed[0]?.id || "");
    } else {
      const firstChat = createChat();
      setChats([firstChat]);
      setActiveId(firstChat.id);
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("madhurex-chats", JSON.stringify(chats));
    }
  }, [chats]);

  const activeChat = chats.find((chat) => chat.id === activeId);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [chats, search]);

  function updateChat(id: string, updater: (chat: Chat) => Chat) {
    setChats((current) =>
      current.map((chat) => (chat.id === id ? updater(chat) : chat))
    );
  }

  function newChat() {
    const chat = createChat();
    setChats((current) => [chat, ...current]);
    setActiveId(chat.id);
    setSidebarOpen(false);
  }

  function deleteChat(id: string) {
    const remaining = chats.filter((chat) => chat.id !== id);

    if (remaining.length === 0) {
      const chat = createChat();
      setChats([chat]);
      setActiveId(chat.id);
      return;
    }

    setChats(remaining);

    if (activeId === id) {
      setActiveId(remaining[0].id);
    }
  }

  async function sendMessage(content: string, isvoice: boolean = false){
    if (!activeChat || loading) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    const nextMessages = [...activeChat.messages, userMessage];

    updateChat(activeChat.id, (chat) => ({
      ...chat,
      title:
        chat.messages.length === 0
          ? content.slice(0, 32)
          : chat.title,
      messages: nextMessages,
      updatedAt: Date.now(),
    }));

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: data.content,
        createdAt: Date.now(),
      };

      updateChat(activeChat.id, (chat) => ({
        ...chat,
        messages: [...chat.messages, assistantMessage],
        updatedAt: Date.now(),
      }));

      if (isvoice){
        speak(data.content);
      }
    } catch (error) {
      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content:
          error instanceof Error
            ? `I couldn't complete that request: ${error.message}`
            : "I couldn't complete that request.",
        createdAt: Date.now(),
      };

      updateChat(activeChat.id, (chat) => ({
        ...chat,
        messages: [...chat.messages, assistantMessage],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  }

  function handleMic() {
    startListening((text) => {
      void sendMessage(text, true);
    });
  }

  return (
    <main className="dot-grid min-h-screen">
      <div className="flex min-h-screen">
        <aside
          className={`glass fixed inset-y-0 left-0 z-30 w-80 transform p-5 transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="gradient-text text-2xl font-bold">
                Madhurex
              </div>
              <div className="text-xs text-white/40">AI companion</div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-white/50 hover:bg-white/10 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <button
            onClick={newChat}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            <Plus size={18} />
            New Chat
          </button>

          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3">
            <Search size={16} className="text-white/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-white/35"
            />
          </div>

          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 rounded-2xl px-3 py-3 transition ${
                  chat.id === activeId
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <button
                  onClick={() => {
                    setActiveId(chat.id);
                    setSidebarOpen(false);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <MessageCircle size={16} className="shrink-0 text-cyan-300" />
                  <span className="truncate text-sm text-white/75">
                    {chat.title}
                  </span>
                </button>

                <button
                  onClick={() => deleteChat(chat.id)}
                  className="opacity-0 transition group-hover:opacity-100"
                  aria-label="Delete chat"
                >
                  <Trash2 size={15} className="text-white/40 hover:text-red-300" />
                </button>
              </div>
            ))}
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/55 transition hover:bg-white/10 hover:text-white">
              <Settings size={17} />
              Settings
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <section className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-white/60 hover:bg-white/10 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <h1 className="font-semibold">Madhurex AI</h1>
                <p className="text-xs text-white/40">
                  Your intelligent AI companion.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-cyan-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
              Online
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8">
            {activeChat?.messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-cyan-200/60">
                  <Sparkles size={16} />
                  Madhurex AI
                </div>

                <h2 className="gradient-text max-w-2xl text-4xl font-bold sm:text-6xl">
                  Think freely.
                  <br />
                  Create brilliantly.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-white/45">
                  Ask questions, explore ideas, learn new concepts, write code,
                  or simply have a conversation with your intelligent AI
                  companion.
                </p>

                <AvatarScene
                  listening={listening}
                  speaking={speaking}
                  generating={loading}
                />
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto pb-6">
                {activeChat?.messages?.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {loading && (
                  <div className="flex items-center gap-3 text-sm text-white/45">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                    Madhurex is thinking...
                  </div>
                )}
              </div>
            )}

            <div className="mx-auto w-full max-w-4xl">
              <ChatInput
                disabled={loading}
                listening={listening}
                speaking={speaking}
                onSend={sendMessage}
                onMic={handleMic}
                onStopSpeaking={stopSpeaking}
              />

              <p className="mt-3 text-center text-[11px] text-white/25">
                Madhurex may make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}