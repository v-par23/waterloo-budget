/**
 * Spot Discovery Script for WaterlooBudget
 *
 * Queries the Yelp Fusion Business Search API for budget-friendly places
 * (price level $ or $$) around Waterloo/Kitchener, filters out anything
 * already in src/data/spots.ts, and writes ready-to-review draft entries
 * to scripts/output/ -- nothing is written into spots.ts automatically.
 *
 * Requires YELP_API_KEY in .env.local. OPENAI_API_KEY is optional --
 * if present, it's used to write a nicer one-line description per spot;
 * otherwise descriptions fall back to Yelp's own category labels.
 *
 * Run with: npx tsx scripts/discover-spots.ts
 */
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { spots, spotCoordinates, type Category } from "../src/data/spots";

try {
  process.loadEnvFile(path.join(__dirname, "..", ".env.local"));
} catch {
  // .env.local not found -- fall back to whatever is already in process.env
}

const YELP_API_KEY = process.env.YELP_API_KEY;
if (!YELP_API_KEY) {
  console.error("Missing YELP_API_KEY (expected in .env.local). Aborting.");
  process.exit(1);
}

// Only categories that map cleanly onto real, searchable local businesses.
// Housing/workspots/accelerators stay hand-curated -- Yelp doesn't model those well.
const CATEGORY_CONFIG: Record<
  string,
  {
    category: Category;
    yelpCategories: string;
    emoji: string;
    hasPriceData: boolean;
    minReviewCount?: number;
    idPrefix?: string; // only needed when it differs from `category` (e.g. bars -> "bar-1")
  }
> = {
  food: { category: "food", yelpCategories: "restaurants", emoji: "🍽️", hasPriceData: true },
  coffee: { category: "coffee", yelpCategories: "coffee", emoji: "☕", hasPriceData: true },
  bars: { category: "bars", yelpCategories: "bars", emoji: "🍺", hasPriceData: true, idPrefix: "bar" },
  grocery: { category: "grocery", yelpCategories: "grocery", emoji: "🛒", hasPriceData: true },
  // "gyms" alone (not "fitness" -- that alias doesn't exist in Yelp's taxonomy and
  // was causing it to fall back to an unrelated mix of massage/spa/yoga results).
  // Gyms are membership-based, so Yelp almost never tags them with a $ price level --
  // hasPriceData: false skips both the server-side price filter and our price check.
  // minReviewCount is also lowered: gyms get far fewer Yelp reviews than restaurants
  // (people review on Google instead), so the default threshold left zero results.
  gym: { category: "gym", yelpCategories: "gyms", emoji: "💪", hasPriceData: false, minReviewCount: 1 },
};

// Radius search (not a "City, ON" location string) so results stay tightly around
// each city center instead of Yelp silently widening the search out to Cambridge,
// Guelph, or beyond.
const SEARCH_CENTERS = [
  { name: "Waterloo", lat: 43.4643, lng: -80.5204 },
  { name: "Kitchener", lat: 43.4516, lng: -80.4925 },
];
const SEARCH_RADIUS_METERS = 8000;

// Belt-and-suspenders: even with a tight radius, drop anything Yelp returns whose
// city isn't actually Waterloo/Kitchener.
const ALLOWED_CITIES = new Set(["waterloo", "kitchener"]);

// Category aliases that mean "not actually a gym" even though Yelp's "gyms" search
// sometimes still surfaces them (e.g. a physio clinic that also does sports massage).
const NON_GYM_ALIASES = new Set(["massage", "spas", "yoga", "physicaltherapy", "reflexology", "acupuncture"]);

const MAX_PRICE_LEVEL = 2; // only $ and $$ -- this IS the "budget-friendly" filter
const MIN_RATING = 3.5;
const MIN_REVIEW_COUNT = 5;

interface YelpBusiness {
  id: string;
  name: string;
  is_closed: boolean;
  price?: string; // "$".."$$$$"
  rating: number;
  review_count: number;
  categories: { alias: string; title: string }[];
  coordinates: { latitude: number; longitude: number };
  location: { city: string; address1: string };
}

async function searchYelp(
  center: { name: string; lat: number; lng: number },
  yelpCategories: string,
  hasPriceData: boolean
): Promise<YelpBusiness[]> {
  const params = new URLSearchParams({
    latitude: String(center.lat),
    longitude: String(center.lng),
    radius: String(SEARCH_RADIUS_METERS),
    categories: yelpCategories,
    sort_by: "rating",
    limit: "50",
  });
  if (hasPriceData) {
    params.set("price", Array.from({ length: MAX_PRICE_LEVEL }, (_, i) => String(i + 1)).join(","));
  }
  const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
    headers: { Authorization: `Bearer ${YELP_API_KEY}` },
  });
  if (!res.ok) {
    console.error(`Yelp search failed for ${center.name}/${yelpCategories}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.businesses ?? [];
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function guessNeighborhood(city: string): string {
  const c = city.toLowerCase();
  if (c.includes("kitchener")) return "Kitchener";
  if (c.includes("waterloo")) return "Uptown Waterloo"; // best-effort guess -- review before merging
  return city;
}

// Scans BOTH the `spots` array and the separate `spotCoordinates` map for the highest
// existing number under this id prefix -- the two can drift out of sync (e.g. this
// codebase has orphaned "gym-9"/"gym-10" coordinate entries with no matching spot), and
// picking a number that's merely free in `spots` isn't enough to avoid a collision.
function nextIdsForCategory(category: string, idPrefix: string, count: number): string[] {
  const numsFrom = (ids: string[]) =>
    ids
      .filter((id) => id.startsWith(`${idPrefix}-`))
      .map((id) => Number(id.split("-").pop()))
      .filter((n) => !Number.isNaN(n));

  const fromSpots = numsFrom(spots.filter((s) => s.category === category).map((s) => s.id));
  const fromCoords = numsFrom(Object.keys(spotCoordinates));
  const allNums = [...fromSpots, ...fromCoords];

  let next = (allNums.length ? Math.max(...allNums) : 0) + 1;
  const ids: string[] = [];
  for (let i = 0; i < count; i++) ids.push(`${idPrefix}-${next++}`);
  return ids;
}

interface Candidate {
  id: string;
  name: string;
  category: Category;
  neighborhood: string;
  price: string;
  priceLevel: number;
  emoji: string;
  description: string;
  cuisine?: string;
  lat: number;
  lng: number;
}

async function enrichDescriptions(candidates: Candidate[]): Promise<void> {
  if (!process.env.OPENAI_API_KEY || candidates.length === 0) return;

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const listing = candidates
    .map((c, i) => `${i}. ${c.name} (${c.cuisine ?? c.category}, ${c.price})`)
    .join("\n");

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Write a short, plain one-line description (under 8 words, no marketing fluff) for each budget-friendly Waterloo/Kitchener spot below, in the style of "Vietnamese pho restaurant" or "Hand-pulled noodles". Respond with ONLY a JSON array of strings, same order, same length as the list.\n\n${listing}`,
    });
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const descriptions: string[] = JSON.parse(cleaned);
    descriptions.forEach((d, i) => {
      if (candidates[i] && typeof d === "string") candidates[i].description = d;
    });
  } catch (err) {
    console.error("AI description enrichment failed, keeping fallback descriptions:", err);
  }
}

async function main() {
  const existingNames = new Set(spots.map((s) => normalizeName(s.name)));
  const seenThisRun = new Set<string>();
  const byCategory: Record<string, Candidate[]> = {};

  for (const [key, cfg] of Object.entries(CATEGORY_CONFIG)) {
    const found: YelpBusiness[] = [];
    for (const center of SEARCH_CENTERS) {
      console.log(`Searching Yelp: ${cfg.yelpCategories} near ${center.name}...`);
      const results = await searchYelp(center, cfg.yelpCategories, cfg.hasPriceData);
      found.push(...results);
      await new Promise((r) => setTimeout(r, 250)); // stay well under Yelp's rate limit
    }

    const candidates: Candidate[] = [];
    for (const biz of found) {
      const norm = normalizeName(biz.name);
      if (biz.is_closed) continue;
      if (biz.rating < MIN_RATING || biz.review_count < (cfg.minReviewCount ?? MIN_REVIEW_COUNT)) continue;
      if (existingNames.has(norm) || seenThisRun.has(norm)) continue;
      if (cfg.hasPriceData && !biz.price) continue; // no price data -> can't confirm it's actually budget-friendly
      if (!ALLOWED_CITIES.has(biz.location.city?.toLowerCase().trim())) continue;
      if (cfg.category === "gym" && biz.categories?.some((c) => NON_GYM_ALIASES.has(c.alias))) continue;
      seenThisRun.add(norm);

      const priceLevel = biz.price ? biz.price.length : 2;
      const cuisine = biz.categories?.[0]?.title;

      candidates.push({
        id: "", // assigned after we know the final count for this category
        name: biz.name,
        category: cfg.category,
        neighborhood: guessNeighborhood(biz.location.city),
        price: cfg.hasPriceData ? (priceLevel === 1 ? "~$10-15" : "~$15-25") : "~Membership",
        priceLevel,
        emoji: cfg.emoji,
        description: biz.categories?.map((c) => c.title).join(", ") || cfg.category,
        cuisine,
        lat: biz.coordinates.latitude,
        lng: biz.coordinates.longitude,
      });
    }

    const ids = nextIdsForCategory(cfg.category, cfg.idPrefix ?? cfg.category, candidates.length);
    candidates.forEach((c, i) => (c.id = ids[i]));

    if (candidates.length > 0) {
      await enrichDescriptions(candidates);
      byCategory[key] = candidates;
    }
    console.log(`  -> ${candidates.length} new candidate(s) for "${key}"`);
  }

  const allCandidates = Object.values(byCategory).flat();
  if (allCandidates.length === 0) {
    console.log("\nNo new candidates found (everything matched an existing spot, or none passed the quality/price filters).");
    return;
  }

  const lines: string[] = [];
  lines.push(`// Draft candidate spots found by scripts/discover-spots.ts on ${new Date().toISOString()}`);
  lines.push(`// REVIEW BEFORE MERGING: neighborhoods are a best-effort guess (from Yelp's city field),`);
  lines.push(`// and price/description are rough placeholders. Fix these up, then paste into src/data/spots.ts.`);
  lines.push(`// Gym entries have no real price data (Yelp doesn't tag membership pricing) -- verify`);
  lines.push(`// they're actually budget-friendly (e.g. check for a student rate) before adding.\n`);

  lines.push("// --- Add to the `spots` array: ---");
  for (const c of allCandidates) {
    lines.push(`  {
    id: "${c.id}",
    name: ${JSON.stringify(c.name)},
    category: "${c.category}",
    neighborhood: ${JSON.stringify(c.neighborhood)},
    price: "${c.price}",
    priceLevel: ${c.priceLevel},
    emoji: "${c.emoji}",
    description: ${JSON.stringify(c.description)},${c.cuisine ? `\n    cuisine: ${JSON.stringify(c.cuisine)},` : ""}
    vibe: "moderate",
  },`);
  }

  lines.push("\n// --- Add to the `spotCoordinates` map: ---");
  for (const c of allCandidates) {
    lines.push(`  "${c.id}": { lat: ${c.lat}, lng: ${c.lng} },`);
  }

  const outDir = path.join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `new-spots-${Date.now()}.ts`);
  writeFileSync(outPath, lines.join("\n") + "\n");

  console.log(`\n${allCandidates.length} new candidate spot(s) written to ${path.relative(process.cwd(), outPath)}`);
  console.log("Review it, then copy the entries into src/data/spots.ts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
