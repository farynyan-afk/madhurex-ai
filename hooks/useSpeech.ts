"use client";

import { useCallback, useRef, useState } from "react";

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function useSpeech() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const startListening = useCallback(
    (onText: (text: string) => void) => {
      if (typeof window === "undefined") return;

      const Recognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!Recognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }

      const recognition = new Recognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onText(transcript);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    },
    []
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      text.replace(/```[\s\S]*?```/g, "")
    );

    utterance.rate = 1;
    utterance.pitch = 1.03;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return {
    listening,
    speaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}