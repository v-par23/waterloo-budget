"use client";

import { useCallback, useState } from "react";

export interface SpotReviewsData {
  rating: number | null;
  reviewCount: number;
  url: string | null;
  reviews: { text: string; rating: number; author: string }[];
}

interface UseSpotReviewsResult {
  data: SpotReviewsData | null;
  loading: boolean;
  error: string | null;
  fetchReviews: (spotId: string, name: string, lat: number, lng: number) => void;
}

export function useSpotReviews(): UseSpotReviewsResult {
  const [data, setData] = useState<SpotReviewsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback((spotId: string, name: string, lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ spotId, name, lat: String(lat), lng: String(lng) });

    fetch(`/api/reviews?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reviews");
        return res.json();
      })
      .then((json: SpotReviewsData) => setData(json))
      .catch(() => setError("Couldn't load reviews right now."))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error, fetchReviews };
}
