"use client";

import { Bot, Copy, User } from "lucide-react";
import { useState } from "react";
import MarkdownMessage from "./MarkdownMessage";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

export default function ChatMessage({
  message,
}: {
  message: ChatMessageType;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 text-black">
          <Bot size={17} />
        </div>
      )}

      <div
        className={`max-w-[850px] rounded-3xl px-5 py-4 ${
          isUser
            ? "bg-gradient-to-br from-violet-600/80 to-cyan-500/50"
            : "glass"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-7">
            {message.content}
          </p>
        ) : (
          <MarkdownMessage content={message.content} />
        )}

        {!isUser && (
          <button
            onClick={copyMessage}
            className="mt-4 flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
          >
            <Copy size={14} />
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <User size={16} />
        </div>
      )}
    </div>
  );
}