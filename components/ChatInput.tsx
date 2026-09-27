"use client";

import {
  ImagePlus,
  LoaderCircle,
  Mic,
  MicOff,
  Paperclip,
  Send,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  disabled?: boolean;
  speaking?: boolean;
  onStopSpeaking?: () => void;
  onSend: (message: string) => void;
};

export default function ChatInput({
  disabled,
  speaking,
  onStopSpeaking,
  onSend,
}: Props) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setValue(transcript);
    };

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }

  function submit() {
    const text = value.trim();

    if (!text || disabled) return;

    onSend(text);
    setValue("");
  }

  return (
    <div className="glass flex items-end gap-2 rounded-3xl p-2">
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="Ask Madhurex anything..."
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
      />

      <div className="flex items-center gap-1">
        <label className="cursor-pointer rounded-xl p-3 text-slate-400 transition hover:bg-white/10 hover:text-white">
          <Paperclip size={18} />
          <input type="file" className="hidden" />
        </label>

        <label className="cursor-pointer rounded-xl p-3 text-slate-400 transition hover:bg-white/10 hover:text-white">
          <ImagePlus size={18} />
          <input type="file" accept="image/*" className="hidden" />
        </label>

        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`rounded-xl p-3 transition ${
            listening
              ? "bg-cyan-300 text-slate-950"
              : "text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
          title={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {speaking ? (
          <button
            onClick={onStopSpeaking}
            className="rounded-xl bg-pink-300 p-3 text-slate-950 transition hover:bg-pink-200"
            title="Stop speaking"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="rounded-xl bg-cyan-300 p-3 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            title="Send message"
          >
            {disabled ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}