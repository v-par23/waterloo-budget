import { embed, embedMany } from "ai";
import { openai, EMBEDDING_MODEL } from "./config";
import { spots, Spot, categoryConfig } from "@/data/spots";

// Cache for spot embeddings
let spotEmbeddingsCache: { spot: Spot; embedding: number[] }[] | null = null;

// Create a searchable text representation of a spot
function spotToText(spot: Spot): string {
  const category = categoryConfig[spot.category];
  return `${spot.name}. ${category.label}. ${spot.description || ""}. Located in ${spot.neighborhood}. Price: ${spot.price}. ${spot.isFree ? "Free." : ""}`;
}

// Generate embeddings for all spots
export async function getSpotEmbeddings(): Promise<{ spot: Spot; embedding: number[] }[]> {
  if (spotEmbeddingsCache) {
    return spotEmbeddingsCache;
  }

  const texts = spots.map(spotToText);
  
  const { embeddings } = await embedMany({
    model: openai.embedding(EMBEDDING_MODEL),
    values: texts,
  });

  spotEmbeddingsCache = spots.map((spot, i) => ({
    spot,
    embedding: embeddings[i],
  }));

  return spotEmbeddingsCache;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Find spots similar to a query
export async function findSimilarSpots(
  query: string,
  limit: number = 5
): Promise<{ spot: Spot; score: number }[]> {
  // Get query embedding
  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: query,
  });

  // Get all spot embeddings
  const spotEmbeddings = await getSpotEmbeddings();

  // Calculate similarities
  const similarities = spotEmbeddings.map(({ spot, embedding }) => ({
    spot,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));

  // Sort by similarity and return top results
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Format spots for LLM context
export function formatSpotsForContext(results: { spot: Spot; score: number }[]): string {
  return results
    .map(({ spot, score }) => {
      const category = categoryConfig[spot.category];
      return `- ${spot.name} (${category.label}, ${spot.neighborhood}): ${spot.description || "No description"}. Price: ${spot.price}. ${spot.isFree ? "FREE!" : ""} [Relevance: ${(score * 100).toFixed(0)}%]`;
    })
    .join("\n");
}
