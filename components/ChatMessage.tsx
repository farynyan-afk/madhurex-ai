"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, RotateCcw, UserRound, Sparkles } from "lucide-react";
import { Message } from "@/lib/storage";

type Props = {
  message: Message;
  onRegenerate?: () => void;
};

export default function ChatMessage({ message, onRegenerate }: Props) {
  const isUser = message.role === "user";

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
  }

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
          <Sparkles size={16} />
        </div>
      )}

      <div
        className={`max-w-[min(720px,88%)] rounded-3xl px-5 py-4 ${
          isUser
            ? "bg-cyan-300 text-slate-950"
            : "glass text-slate-100"
        }`}
      >
        <div className="markdown-content text-[15px] leading-7">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && (
          <div className="mt-4 flex gap-2 text-slate-400">
            <button
              onClick={copyMessage}
              className="rounded-lg p-2 transition hover:bg-white/10 hover:text-white"
              title="Copy response"
            >
              <Copy size={15} />
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="rounded-lg p-2 transition hover:bg-white/10 hover:text-white"
                title="Regenerate response"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
          <UserRound size={16} />
        </div>
      )}
    </div>
  );
}