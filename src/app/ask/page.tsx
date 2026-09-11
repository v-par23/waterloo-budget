"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { spots } from "@/data/spots";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/lib/hooks/useSpeechSynthesis";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUERIES = [
  "Where can I get cheap food near UW?",
  "Best coffee shops to study at?",
  "Free places to work late?",
  "Good gyms on a student budget?",
  "Where do founders hang out?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    isSupported: voiceSupported,
    isListening,
    error: voiceError,
    startListening,
  } = useSpeechRecognition((text) => setInput((prev) => (prev ? `${prev} ${text}` : text)));
  const { isSupported: speechSupported, speakingId, speak } = useSpeechSynthesis();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          setMessages((prev) => {
            const lastIndex = prev.length - 1;
            const lastMsg = prev[lastIndex];
            if (lastMsg.role !== "assistant") return prev;
            const updated = [...prev];
            updated[lastIndex] = { ...lastMsg, content: lastMsg.content + chunk };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Ask <span className="text-ink">Waterloo</span>
          <span className="text-accent">Budget</span>
        </h1>
        <p className="text-sm sm:text-base text-ink/70 mt-1">
          AI-powered recommendations for budget-friendly spots in Waterloo
        </p>
      </div>

      <div className="receipt-divider mb-4" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 pr-1 sm:pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-ink mb-2">
              What are you looking for?
            </h2>
            <p className="text-sm sm:text-base text-ink/60 mb-4 sm:mb-6 px-4">
              Ask me anything about budget-friendly spots in Waterloo
            </p>

            {/* Suggested queries */}
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {SUGGESTED_QUERIES.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSuggestionClick(query)}
                  className="receipt-chip-dash normal-case"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 border-1.5 ${
                  message.role === "user"
                    ? "bg-ink text-cream border-ink"
                    : "bg-paper text-ink border-ink"
                }`}
                style={{ borderWidth: "1.5px", borderStyle: "solid" }}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                {message.role === "assistant" && speechSupported && message.content && (
                  <button
                    onClick={() => speak(message.id, message.content)}
                    className="mt-2 text-[11px] font-bold uppercase tracking-wide text-ink/50 hover:text-accent flex items-center gap-1"
                  >
                    {speakingId === message.id ? "Stop" : "Read aloud"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="border-1.5 border-ink bg-paper px-4 py-3" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
              <div className="flex items-center gap-2 text-ink/50">
                <div className="text-lg leading-none">...</div>
                <span className="text-sm uppercase tracking-wide">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ASK ABOUT PLACES IN WATERLOO..."
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-transparent border-0 border-b-2 border-ink uppercase tracking-wide placeholder:text-ink/50 focus:outline-none text-ink"
          disabled={isLoading}
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={startListening}
            disabled={isLoading}
            title="Ask by voice"
            className={`px-3 sm:px-4 py-2.5 sm:py-3 border-1.5 transition-colors disabled:opacity-50 flex items-center justify-center ${
              isListening
                ? "bg-accent/10 border-accent text-accent animate-pulse"
                : "border-ink text-ink/60 hover:text-ink"
            }`}
            style={{ borderWidth: "1.5px", borderStyle: "solid" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        )}
        <button type="submit" disabled={isLoading || !input.trim()} className="receipt-btn w-auto px-4 sm:px-6 !bg-ink !text-cream disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "..." : "Ask"}
        </button>
      </form>
      {voiceError && <p className="text-center text-xs text-red-600 mt-1">{voiceError}</p>}

      {/* Footer note */}
      <p className="text-center text-[10px] uppercase tracking-widest text-ink/40 mt-2 sm:mt-3">
        Powered by AI • Recommendations based on our curated database of {spots.length} spots
      </p>
    </div>
  );
}
