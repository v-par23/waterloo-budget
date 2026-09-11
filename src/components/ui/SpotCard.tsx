"use client";

import { Spot, categoryConfig, spotCoordinates, vibeConfig } from "@/data/spots";
import { useAuth } from "@/components/AuthProvider";
import { useSavedSpots } from "@/components/SavedSpotsProvider";
import { useRouter } from "next/navigation";
import { formatDistance } from "@/lib/geo";
import { SpotReviewsSection } from "@/components/ui/SpotReviewsSection";

interface SpotCardProps {
  spot: Spot;
  showSaveButton?: boolean;
  searchQuery?: string;
  distanceMeters?: number;
  compareMode?: boolean;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (spotId: string) => void;
}

// Highlight matching text in search results
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-accent/30 text-ink">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function SpotCard({
  spot,
  showSaveButton = true,
  searchQuery = "",
  distanceMeters,
  compareMode = false,
  isCompareSelected = false,
  compareDisabled = false,
  onToggleCompare,
}: SpotCardProps) {
  const { user } = useAuth();
  const { isSpotSaved, toggleSave } = useSavedSpots();
  const router = useRouter();
  const isSaved = isSpotSaved(spot.id);
  const config = categoryConfig[spot.category];
  const coords = spotCoordinates[spot.id];

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    const result = await toggleSave(spot.id);
    if (result.error) {
      console.error("Save error:", result.error);
      alert(`Error saving spot: ${result.error}`);
    }
  };

  const handleLogSpendClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    const params = new URLSearchParams({ spotId: spot.id });
    if (!spot.isFree) {
      const amount = parseFloat(spot.price.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(amount)) params.set("amount", String(amount));
    }
    router.push(`/budget?${params.toString()}`);
  };

  const handleCardClick = () => {
    if (compareMode && onToggleCompare && !(compareDisabled && !isCompareSelected)) {
      onToggleCompare(spot.id);
    }
  };

  return (
    <div
      onClick={compareMode ? handleCardClick : undefined}
      className={`receipt-card p-5 flex flex-col gap-2.5 transition-opacity ${
        compareMode
          ? compareDisabled && !isCompareSelected
            ? "opacity-40 cursor-not-allowed"
            : "cursor-pointer"
          : ""
      } ${compareMode && isCompareSelected ? "outline outline-2 outline-accent outline-offset-2" : ""}`}
    >
      {/* Compare checkbox */}
      {compareMode && (
        <div
          className={`absolute -top-3 right-4 w-6 h-6 border-1.5 flex items-center justify-center z-10 ${
            isCompareSelected ? "bg-ink border-ink" : "bg-cream border-ink"
          }`}
          style={{ borderWidth: "1.5px", borderStyle: "solid" }}
        >
          {isCompareSelected && (
            <svg className="w-3.5 h-3.5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Save / tap-to-save tag */}
      {showSaveButton && !compareMode && (
        <button
          onClick={handleSaveClick}
          title={isSaved ? "Remove from saved" : "Save spot"}
          className={`receipt-tag absolute -top-3 right-4 z-10 ${isSaved ? "!bg-accent !text-cream !border-accent" : ""}`}
        >
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 3h8a1 1 0 0 1 1 1v11l-5-3-5 3V4a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeWidth="1.3"
              fill={isSaved ? "currentColor" : "none"}
            />
          </svg>
          {isSaved ? "Saved" : "Tap to save"}
        </button>
      )}

      {/* Category + price */}
      <div className="flex items-center justify-between">
        <span className="bg-ink text-cream text-[10px] font-bold tracking-widest px-2 py-1 uppercase">
          {config.label}
        </span>
        <span className="font-bold text-base text-accent">
          {spot.isFree ? "Free" : spot.price}
        </span>
      </div>

      {/* Name */}
      <div className="text-lg font-bold leading-tight flex items-center gap-2">
        <span>{spot.emoji}</span>
        <span className="truncate">{highlightMatch(spot.name, searchQuery)}</span>
      </div>

      {/* Location + cuisine */}
      <div className="text-[11px] uppercase tracking-wide text-ink/60 -mt-1.5">
        {highlightMatch(spot.neighborhood, searchQuery)}
        {spot.cuisine && <> · {spot.cuisine}</>}
      </div>

      {/* Distance */}
      {typeof distanceMeters === "number" && (
        <span className="receipt-chip-dash self-start text-[10px]">
          {formatDistance(distanceMeters)} away
        </span>
      )}

      {/* Vibe (hand-curated estimate, not live data) */}
      {spot.vibe && (
        <span
          title="Estimated typical vibe — not live crowd data"
          className="receipt-chip-dash self-start text-[10px]"
        >
          {vibeConfig[spot.vibe].label}
        </span>
      )}

      {/* Description */}
      {spot.description && (
        <p className="text-[13px] leading-snug text-ink/80 line-clamp-2">{spot.description}</p>
      )}

      <div className="receipt-divider-dash mt-1" />

      {/* Reviews + Directions */}
      {coords && (
        <SpotReviewsSection
          spotId={spot.id}
          spotName={spot.name}
          lat={coords.lat}
          lng={coords.lng}
        />
      )}

      {/* Log spend */}
      <button onClick={handleLogSpendClick} className="receipt-btn mt-1">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M12.3 8.1a2.4 2.4 0 0 0-2.3-1.3c-1.3 0-2.3.6-2.3 1.6s.9 1.2 2.3 1.5c1.4.3 2.3.6 2.3 1.6s-1 1.6-2.3 1.6a2.4 2.4 0 0 1-2.3-1.3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <line x1="10" y1="5.3" x2="10" y2="6.6" stroke="currentColor" strokeWidth="1.3" />
          <line x1="10" y1="13.3" x2="10" y2="14.7" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        Log spend
      </button>
    </div>
  );
}
