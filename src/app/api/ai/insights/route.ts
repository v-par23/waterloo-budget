import { generateText } from "ai";
import { openai, CHAT_MODEL } from "@/lib/ai/config";
import { spots, categoryConfig, Category } from "@/data/spots";

export const maxDuration = 30;

// Get current time context
function getTimeContext(): { period: string; emoji: string; description: string } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 11) {
    return { period: "morning", emoji: "🌅", description: "Good morning! Here are some breakfast and coffee spots to start your day." };
  } else if (hour >= 11 && hour < 14) {
    return { period: "lunch", emoji: "☀️", description: "Lunchtime! Here are affordable spots to grab a bite." };
  } else if (hour >= 14 && hour < 17) {
    return { period: "afternoon", emoji: "🌤️", description: "Afternoon vibes! Great time for coffee or a study session." };
  } else if (hour >= 17 && hour < 21) {
    return { period: "evening", emoji: "🌆", description: "Evening time! Dinner spots and places to unwind." };
  } else {
    return { period: "night", emoji: "🌙", description: "Late night! Here's what's still open and budget-friendly." };
  }
}

// Get season context
function getSeasonContext(): { season: string; emoji: string } {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return { season: "spring", emoji: "🌸" };
  if (month >= 5 && month <= 7) return { season: "summer", emoji: "☀️" };
  if (month >= 8 && month <= 10) return { season: "fall", emoji: "🍂" };
  return { season: "winter", emoji: "❄️" };
}

// Get spots by category with budget info
function getSpotsByCategory(category: Category) {
  return spots
    .filter(s => s.category === category)
    .sort((a, b) => a.priceLevel - b.priceLevel);
}

// Get cheapest spots
function getCheapestSpots(limit = 5) {
  return spots
    .filter(s => s.priceLevel === 1 || s.isFree)
    .slice(0, limit);
}

// Get free spots
function getFreeSpots() {
  return spots.filter(s => s.isFree);
}

export async function GET() {
  try {
    const timeContext = getTimeContext();
    const seasonContext = getSeasonContext();
    
    // Get relevant spots for each insight type
    const cheapestSpots = getCheapestSpots(8);
    const freeSpots = getFreeSpots();
    const coffeeSpots = getSpotsByCategory("coffee").slice(0, 5);
    const foodSpots = getSpotsByCategory("food").slice(0, 8);
    const workSpots = getSpotsByCategory("workspots").slice(0, 5);
    
    // Build context for AI
    const spotsContext = `
CHEAPEST SPOTS (Price Level 1):
${cheapestSpots.map(s => `- ${s.name} (${s.category}): ${s.price} - ${s.description || "No description"}`).join("\n")}

FREE SPOTS:
${freeSpots.map(s => `- ${s.name}: ${s.description || "No description"}`).join("\n")}

COFFEE SHOPS:
${coffeeSpots.map(s => `- ${s.name}: ${s.price} - ${s.description || "No description"}`).join("\n")}

FOOD SPOTS (Budget-Friendly):
${foodSpots.map(s => `- ${s.name}: ${s.price} - ${s.description || "No description"}`).join("\n")}

WORK/STUDY SPOTS:
${workSpots.map(s => `- ${s.name}: ${s.price} - ${s.description || "No description"}`).join("\n")}
`;

    // Generate AI insights
    const { text: aiInsights } = await generateText({
      model: openai(CHAT_MODEL),
      prompt: `You are a helpful local guide for budget-conscious students in Waterloo, Ontario. It's currently ${timeContext.period} in ${seasonContext.season}.

Based on these spots, generate 4 short, actionable insights for students today. Each insight should be 1-2 sentences max.

${spotsContext}

Generate insights in this exact JSON format (no markdown, just raw JSON):
{
  "insights": [
    {
      "title": "Short catchy title (3-5 words)",
      "description": "1-2 sentence actionable tip mentioning specific spots",
      "emoji": "relevant emoji",
      "spots": ["Spot Name 1", "Spot Name 2"],
      "type": "budget|time|study|social"
    }
  ]
}

Focus on:
1. A time-appropriate recommendation (it's ${timeContext.period})
2. A budget-saving tip
3. A study/work recommendation
4. Something social or seasonal (${seasonContext.season})

Be specific - mention actual spot names from the list. Keep it casual and helpful.`,
    });

    // Parse AI response
    let insights;
    try {
      // Clean up response - remove any markdown formatting
      const cleanJson = aiInsights.replace(/```json\n?|\n?```/g, "").trim();
      insights = JSON.parse(cleanJson);
    } catch {
      // Fallback insights if parsing fails
      insights = {
        insights: [
          {
            title: "Best Budget Bites",
            description: `${cheapestSpots[0]?.name || "Lazeez Shawarma"} offers filling meals under $12 - perfect for students!`,
            emoji: "💰",
            spots: cheapestSpots.slice(0, 2).map(s => s.name),
            type: "budget"
          },
          {
            title: "Free Study Spots",
            description: `${freeSpots[0]?.name || "DC Library"} is open and free - great wifi and quiet atmosphere.`,
            emoji: "📚",
            spots: freeSpots.slice(0, 2).map(s => s.name),
            type: "study"
          },
          {
            title: "Caffeine Fix",
            description: `Need coffee? ${coffeeSpots[0]?.name || "Williams Fresh Cafe"} has the best value for students.`,
            emoji: "☕",
            spots: coffeeSpots.slice(0, 2).map(s => s.name),
            type: "time"
          },
          {
            title: "Student Favorites",
            description: `${foodSpots[0]?.name || "Gol's Lanzhou Noodle"} is a student favorite for good reason - fresh and affordable!`,
            emoji: "⭐",
            spots: foodSpots.slice(0, 2).map(s => s.name),
            type: "social"
          }
        ]
      };
    }

    return Response.json({
      timeContext,
      seasonContext,
      insights: insights.insights,
      stats: {
        totalSpots: spots.length,
        freeSpots: freeSpots.length,
        categories: Object.keys(categoryConfig).length,
      }
    });
  } catch (error) {
    console.error("Insights error:", error);
    return Response.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
