const YELP_API_BASE = "https://api.yelp.com/v3";

export interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  url: string;
}

export interface YelpReview {
  text: string;
  rating: number;
  user: { name: string };
}

async function yelpFetch(path: string) {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    throw new Error("YELP_API_KEY is not configured");
  }

  const res = await fetch(`${YELP_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    throw new Error(`Yelp API error: ${res.status}`);
  }

  return res.json();
}

// Finds the best-matching Yelp business for a spot near the given coordinates.
export async function findYelpBusiness(
  name: string,
  lat: number,
  lng: number
): Promise<YelpBusiness | null> {
  const params = new URLSearchParams({
    term: name,
    latitude: String(lat),
    longitude: String(lng),
    limit: "1",
  });
  const data = await yelpFetch(`/businesses/search?${params.toString()}`);
  return data.businesses?.[0] ?? null;
}

// Yelp's free tier returns up to 3 review excerpts (not full review text) per business.
export async function getYelpReviews(businessId: string): Promise<YelpReview[]> {
  const data = await yelpFetch(`/businesses/${businessId}/reviews?limit=3&sort_by=yelp_sort`);
  return data.reviews ?? [];
}
