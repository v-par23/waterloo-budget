import { NextRequest, NextResponse } from "next/server";
import { findYelpBusiness, getYelpReviews } from "@/lib/yelp";

interface ReviewsResult {
  rating: number | null;
  reviewCount: number;
  url: string | null;
  reviews: { text: string; rating: number; author: string }[];
}

// In-memory cache so repeat views of the same spot don't re-hit Yelp (resets on server restart).
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const cache = new Map<string, { timestamp: number; data: ReviewsResult }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spotId = searchParams.get("spotId");
  const name = searchParams.get("name");
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!spotId || !name || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "Missing required params: spotId, name, lat, lng" },
      { status: 400 }
    );
  }

  const cached = cache.get(spotId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const business = await findYelpBusiness(name, lat, lng);

    if (!business) {
      const empty: ReviewsResult = { rating: null, reviewCount: 0, url: null, reviews: [] };
      cache.set(spotId, { timestamp: Date.now(), data: empty });
      return NextResponse.json(empty);
    }

    // Review text snippets require Yelp's Enhanced/Premium tier; the free Base tier
    // only supports rating/review count, so this fails gracefully on our tier.
    const reviews = await getYelpReviews(business.id).catch(() => []);
    const result: ReviewsResult = {
      rating: business.rating,
      reviewCount: business.review_count,
      url: business.url,
      reviews: reviews.map((r) => ({
        text: r.text,
        rating: r.rating,
        author: r.user.name,
      })),
    };

    cache.set(spotId, { timestamp: Date.now(), data: result });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Yelp reviews fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 502 });
  }
}
