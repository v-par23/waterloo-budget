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
          className="text-[11px] font-bold uppercase tracking-wide text-ink/80 hover:text-ink flex items-center gap-1"
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
          className="text-[11px] font-bold uppercase tracking-wide text-accent hover:text-ink flex items-center gap-1 flex-shrink-0"
        >
          Directions →
        </a>
      </div>

      {showReviews && (
        <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
          {reviewsLoading && <p className="text-xs text-ink/50">Loading reviews…</p>}
          {reviewsError && <p className="text-xs text-red-600">{reviewsError}</p>}
          {reviewsData && !reviewsData.rating && (
            <p className="text-xs text-ink/50">No Yelp listing found for this spot.</p>
          )}
          {reviewsData?.rating != null && reviewsData.reviews.length === 0 && (
            <p className="text-xs text-ink/50">
              {reviewsData.reviewCount} review{reviewsData.reviewCount === 1 ? "" : "s"} on Yelp — tap below to read them.
            </p>
          )}
          {reviewsData?.reviews.map((review, i) => (
            <div key={i} className="text-xs border border-dashed border-ink/30 p-2">
              <p className="font-bold text-ink">
                {review.author} · {"⭐".repeat(Math.round(review.rating))}
              </p>
              <p className="text-ink/60 mt-0.5 line-clamp-3">{review.text}</p>
            </div>
          ))}
          {reviewsData?.url && (
            <a
              href={reviewsData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-accent hover:underline inline-block"
            >
              View on Yelp →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
