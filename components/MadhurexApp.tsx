"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Menu, Sparkles, Volume2 } from "lucide-react";
import AvatarScene from "./AvatarScene";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";
import {
  Conversation,
  loadConversations,
  Message,
  saveConversations,
} from "@/lib/storage";
import { createId } from "@/lib/utils";

export default function MadhurexApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "listening" | "thinking" | "speaking"
  >("idle");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const saved = loadConversations();
    setConversations(saved);

    if (saved[0]) {
      setActiveId(saved[0].id);
    }
  }, []);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) || null,
    [conversations, activeId],
  );

  function createConversation() {
    const conversation: Conversation = {
      id: createId(),
      title: "New conversation",
      messages: [],
      updatedAt: Date.now(),
    };

    setConversations((previous) => [conversation, ...previous]);
    setActiveId(conversation.id);
    setSidebarOpen(false);
  }

  function deleteConversation(id: string) {
    const next = conversations.filter((item) => item.id !== id);
    setConversations(next);
    setActiveId(next[0]?.id || null);
  }

  function updateConversation(id: string, messages: Message[]) {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              messages,
              updatedAt: Date.now(),
              title:
                conversation.title === "New conversation" && messages[0]
                  ? messages[0].content.slice(0, 34)
                  : conversation.title,
            }
          : conversation,
      ),
    );
  }

  async function sendMessage(text: string) {
    let conversation = activeConversation;

    if (!conversation) {
      const newConversation: Conversation = {
        id: createId(),
        title: text.slice(0, 34),
        messages: [],
        updatedAt: Date.now(),
      };

      setConversations((previous) => [newConversation, ...previous]);
      setActiveId(newConversation.id);
      conversation = newConversation;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: text,
    };

    const assistantMessage: Message = {
      id: createId(),
      role: "assistant",
      content: "",
    };

    const messages = [...conversation.messages, userMessage, assistantMessage];

    updateConversation(conversation.id, messages);
    setStatus("thinking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...conversation.messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("AI request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const data = line.replace(/^data:\s*/, "").trim();

          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || "";

            fullResponse += token;

            updateConversation(conversation!.id, [
              ...conversation!.messages,
              userMessage,
              {
                ...assistantMessage,
                content: fullResponse,
              },
            ]);
          } catch {
            // Ignore malformed stream fragments.
          }
        }
      }

      speakText(fullResponse);
    } catch {
      updateConversation(conversation.id, [
        ...conversation.messages,
        userMessage,
        {
          ...assistantMessage,
          content:
            "I’m sorry, but I couldn’t connect to the AI service. Please check your server configuration and try again.",
        },
      ]);
    } finally {
      setStatus("idle");
    }
  }

  function speakText(text: string) {
    if (!("speechSynthesis" in window) || !text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      setSpeaking(true);
      setStatus("speaking");
    };

    utterance.onend = () => {
      setSpeaking(false);
      setStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setStatus("idle");
  }

  function regenerate() {
    if (!activeConversation) return;

    const previousUserMessage = [...activeConversation.messages]
      .reverse()
      .find((message) => message.role === "user");

    if (previousUserMessage) {
      sendMessage(previousUserMessage.content);
    }
  }

  if (!activeConversation) {
    return (
      <main className="mesh-background min-h-screen text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-slate-950 shadow-[0_0_45px_rgba(94,231,255,0.3)]">
              <Sparkles />
            </div>
            <span className="font-display text-2xl font-semibold">
              Madhurex AI
            </span>
          </div>

          <h1 className="font-display neon-text max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
            Your intelligent AI companion.
          </h1>

          <p className="mt-5 max-w-xl text-slate-400">
            Think clearer, create faster, and explore ideas with Madhurex.
          </p>

          <div className="my-8 w-full max-w-xl">
            <AvatarScene status={status} />
          </div>

          <button
            onClick={createConversation}
            className="rounded-2xl bg-cyan-300 px-7 py-4 font-semibold text-slate-950 shadow-[0_0_35px_rgba(94,231,255,0.24)] transition hover:scale-[1.03] hover:bg-cyan-200"
          >
            Start Chat
          </button>

          <p className="mt-5 text-xs text-slate-500">
            Ask questions, brainstorm ideas, learn, write, code, and more.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mesh-background flex min-h-screen text-white">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
        onNewChat={createConversation}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
      />

      <section className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            >
              <Menu size={19} />
            </button>

            <div>
              <p className="font-display text-sm font-semibold">
                {activeConversation.title}
              </p>
              <p className="text-xs text-slate-500">Madhurex is online</p>
            </div>
          </div>

          <button
            onClick={() => window.speechSynthesis.cancel()}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            title="Stop audio"
          >
            <Volume2 size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
          <div className="mx-auto max-w-4xl space-y-6">
            {activeConversation.messages.length === 0 ? (
              <div className="grid gap-4 py-10 md:grid-cols-3">
                {[
                  "Explain quantum computing simply",
                  "Help me brainstorm a business idea",
                  "Write a Python function for sorting data",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="glass rounded-2xl p-5 text-left text-sm text-slate-300 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              activeConversation.messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={
                    index === activeConversation.messages.length - 1
                      ? regenerate
                      : undefined
                  }
                />
              ))
            )}

            {status === "thinking" && (
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-pink-300 [animation-delay:240ms]" />
                </div>
                Madhurex is thinking…
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#070a13]/80 px-4 py-4 backdrop-blur-xl md:px-10">
          <div className="mx-auto max-w-4xl">
            <ChatInput
              disabled={status === "thinking"}
              speaking={speaking}
              onStopSpeaking={stopSpeaking}
              onSend={sendMessage}
            />

            <p className="mt-3 text-center text-[11px] text-slate-600">
              Madhurex may occasionally make mistakes. Verify important
              information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}