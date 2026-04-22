import { createOpenAI } from "@ai-sdk/openai";

// Initialize OpenAI client
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model configurations
export const CHAT_MODEL = "gpt-4o-mini";
export const EMBEDDING_MODEL = "text-embedding-3-small";
