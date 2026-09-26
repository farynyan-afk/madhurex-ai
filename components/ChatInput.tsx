"use client";

import {
  Image,
  Mic,
  Paperclip,
  Send,
  Square,
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";

type Props = {
  disabled?: boolean;
  listening?: boolean;
  speaking?: boolean;
  onSend: (message: string) => void;
  onMic: () => void;
  onStopSpeaking: () => void;
};

export default function ChatInput({
  disabled,
  listening,
  speaking,
  onSend,
  onMic,
  onStopSpeaking,
}: Props) {
  const [value, setValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();

    const text = value.trim();

    if (!text || disabled) return;

    onSend(text);
    setValue("");
  }

  return (
    <form
      onSubmit={submit}
      className="glass glow flex items-end gap-2 rounded-3xl p-2"
    >
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,image/*"
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl p-3 text-white/45 transition hover:bg-white/10 hover:text-white"
        aria-label="Upload file"
      >
        <Paperclip size={18} />
      </button>

      <button
        type="button"
        className="hidden rounded-2xl p-3 text-white/45 transition hover:bg-white/10 hover:text-white sm:block"
        aria-label="Upload image"
      >
        <Image size={18} />
      </button>

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit(event);
          }
        }}
        rows={1}
        placeholder="Ask Madhurex anything..."
        className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-white/35"
      />

      <button
        type="button"
        onClick={speaking ? onStopSpeaking : onMic}
        className={`rounded-2xl p-3 transition ${
          listening || speaking
            ? "bg-pink-500 text-white"
            : "text-white/55 hover:bg-white/10 hover:text-white"
        }`}
        aria-label={speaking ? "Stop speaking" : "Use microphone"}
      >
        {speaking ? <Square size={17} /> : <Mic size={19} />}
      </button>

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 p-3 text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
}