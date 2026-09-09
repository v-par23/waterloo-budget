"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Minimal shape of the Web Speech API we rely on (no official TS lib types exist for it yet).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const noopSubscribe = () => () => {};
const getSupportSnapshot = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const getSupportServerSnapshot = () => false;

interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

// Voice-to-text via the browser's built-in Web Speech API. No API key or server round-trip.
// Supported in Chrome/Edge/Safari; not in Firefox, so callers should hide the mic UI when
// isSupported is false.
export function useSpeechRecognition(onFinalResult: (text: string) => void): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  // Server snapshot is always false, matching SSR markup; the real value only exists client-side.
  const isSupported = useSyncExternalStore(noopSubscribe, getSupportSnapshot, getSupportServerSnapshot);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Voice input isn't supported in this browser.");
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      if (text.trim()) {
        onFinalResultRef.current(text.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone access was denied. Enable it in your browser settings."
          : "Couldn't hear that. Try again."
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, error, startListening, stopListening };
}
