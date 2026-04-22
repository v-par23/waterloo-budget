import { streamText } from "ai";
import { openai, CHAT_MODEL } from "@/lib/ai/config";
import { findSimilarSpots, formatSpotsForContext } from "@/lib/ai/embeddings";
import { spots, categoryConfig } from "@/data/spots";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a helpful local guide for Waterloo, Ontario - home to the University of Waterloo and a thriving tech/startup ecosystem. Your job is to recommend budget-friendly spots to students, founders, and anyone building in Canada's tech hub.

You have access to a curated database of spots in Waterloo/Kitchener. When answering:
1. Be friendly and conversational, like a helpful upperclassman or local friend
2. Give specific recommendations from the provided spots
3. Mention prices and neighborhoods to help with planning
4. If someone asks about something not in your database, be honest and suggest they explore
5. Keep responses concise but helpful - 2-3 recommendations is usually enough
6. Use emojis sparingly to keep things fun

Categories available: ${Object.values(categoryConfig).map(c => c.label).join(", ")}

Total spots in database: ${spots.length}`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the user's latest message
  const userMessage = messages[messages.length - 1]?.content || "";

  // Find relevant spots using semantic search
  const relevantSpots = await findSimilarSpots(userMessage, 8);
  const spotsContext = formatSpotsForContext(relevantSpots);

  // Create enhanced system prompt with relevant spots
  const enhancedSystemPrompt = `${SYSTEM_PROMPT}

Based on the user's query, here are the most relevant spots from our database:
${spotsContext}

Use these spots to provide helpful recommendations. You can mention 2-4 of the most relevant ones.`;

  const result = streamText({
    model: openai(CHAT_MODEL),
    system: enhancedSystemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
