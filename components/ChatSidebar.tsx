"use client";

import {
  ChevronLeft,
  Clock3,
  Menu,
  MessageSquarePlus,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Conversation } from "@/lib/storage";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ChatSidebar({
  conversations,
  activeId,
  open,
  onToggle,
  onNewChat,
  onSelect,
  onDelete,
}: Props) {
  return (
    <>
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 rounded-xl border border-white/10 bg-slate-950/80 p-3 text-white backdrop-blur md:hidden"
      >
        <Menu size={19} />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] transform border-r border-white/10 bg-[#090d18]/95 p-4 backdrop-blur-xl transition-transform md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-slate-950">
              <Sparkles size={17} />
            </div>
            <span className="font-display font-semibold">Madhurex AI</span>
          </div>

          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          <MessageSquarePlus size={17} />
          New Chat
        </button>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-400">
          <Search size={16} />
          <input
            placeholder="Search chats"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="mb-3 flex items-center gap-2 px-2 text-xs uppercase tracking-widest text-slate-500">
          <Clock3 size={14} />
          History
        </div>

        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-sm transition ${
                conversation.id === activeId
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <button
                onClick={() => onSelect(conversation.id)}
                className="min-w-0 flex-1 truncate text-left"
              >
                {conversation.title}
              </button>

              <button
                onClick={() => onDelete(conversation.id)}
                className="opacity-0 transition group-hover:opacity-100"
                title="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white">
            <Settings size={17} />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}