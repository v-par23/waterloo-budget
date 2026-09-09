"use client";

import { useState } from "react";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import { useSpotReviews } from "@/lib/hooks/useSpotReviews";

interface SpotReviewsSectionProps {
  spotId: string;
  spotName: string;
  lat: number;
  lng: number;
  className?: string;
}

// Shared "reviews toggle + directions link" block, used on both the Spots list
// cards and the Map's spot popups so the two surfaces stay in sync.
export function SpotReviewsSection({ spotId, spotName, lat, lng, className = "" }: SpotReviewsSectionProps) {
  const [showReviews, setShowReviews] = useState(false);
  const { data: reviewsData, loading: reviewsLoading, error: reviewsError, fetchReviews } = useSpotReviews();

  const handleReviewsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !showReviews;
    setShowReviews(next);
    if (next && !reviewsData && !reviewsLoading) {
      fetchReviews(spotId, spotName, lat, lng);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleReviewsClick}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {showReviews
            ? "Hide reviews"
            : reviewsData?.rating
            ? `⭐ ${reviewsData.rating} (${reviewsData.reviewCount}) · See reviews`
            : "⭐ See reviews"}
        </button>
        <a
          href={googleMapsDirectionsUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
        >
          🧭 Directions
        </a>
      </div>

      {showReviews && (
        <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
          {reviewsLoading && <p className="text-xs text-gray-400">Loading reviews…</p>}
          {reviewsError && <p className="text-xs text-red-500">{reviewsError}</p>}
          {reviewsData && !reviewsData.rating && (
            <p className="text-xs text-gray-400">No Yelp listing found for this spot.</p>
          )}
          {reviewsData?.rating != null && reviewsData.reviews.length === 0 && (
            <p className="text-xs text-gray-400">
              {reviewsData.reviewCount} review{reviewsData.reviewCount === 1 ? "" : "s"} on Yelp — tap below to read them.
            </p>
          )}
          {reviewsData?.reviews.map((review, i) => (
            <div key={i} className="text-xs bg-gray-50 rounded-lg p-2">
              <p className="font-medium text-gray-700">
                {review.author} · {"⭐".repeat(Math.round(review.rating))}
              </p>
              <p className="text-gray-500 mt-0.5 line-clamp-3">{review.text}</p>
            </div>
          ))}
          {reviewsData?.url && (
            <a
              href={reviewsData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline inline-block"
            >
              View on Yelp →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
