"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const getSupportSnapshot = () => "speechSynthesis" in window;
const getSupportServerSnapshot = () => false;

interface UseSpeechSynthesisResult {
  isSupported: boolean;
  speakingId: string | null;
  speak: (id: string, text: string) => void;
  stop: () => void;
}

// Text-to-speech via the browser's built-in SpeechSynthesis API. No API key needed.
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Server snapshot is always false, matching SSR markup; the real value only exists client-side.
  const isSupported = useSyncExternalStore(noopSubscribe, getSupportSnapshot, getSupportServerSnapshot);

  const stop = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [isSupported]);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!isSupported) return;

      window.speechSynthesis.cancel();

      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, speakingId]
  );

  return { isSupported, speakingId, speak, stop };
}
