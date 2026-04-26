"use client";

import { Spot, categoryConfig } from "@/data/spots";
import { useAuth } from "@/components/AuthProvider";
import { useSavedSpots } from "@/components/SavedSpotsProvider";
import { useRouter } from "next/navigation";

interface SpotCardProps {
  spot: Spot;
  showSaveButton?: boolean;
  searchQuery?: string;
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
      <mark className="bg-yellow-200 rounded px-0.5">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function SpotCard({ spot, showSaveButton = true, searchQuery = "" }: SpotCardProps) {
  const { user } = useAuth();
  const { isSpotSaved, toggleSave } = useSavedSpots();
  const router = useRouter();
  const isSaved = isSpotSaved(spot.id);
  const config = categoryConfig[spot.category];

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

  // Price badge styling based on price level
  const getPriceBadgeStyle = () => {
    if (spot.isFree) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (spot.priceLevel <= 1) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (spot.priceLevel === 2) return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-red-50 text-red-600 border-red-100";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer relative group">
      {/* Save button */}
      {showSaveButton && (
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
          title={isSaved ? "Remove from saved" : "Save spot"}
        >
          {isSaved ? (
            <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      )}

      {/* Card content */}
      <div className="p-4">
        {/* Top row: Icon + Name/Location */}
        <div className="flex items-start gap-3">
          {/* Icon container */}
          <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <span className="text-lg">{spot.emoji}</span>
          </div>
          
          {/* Name and location */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {highlightMatch(spot.name, searchQuery)}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {highlightMatch(spot.neighborhood, searchQuery)}
            </p>
          </div>

        </div>

        {/* Description */}
        {spot.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-1">{spot.description}</p>
        )}

        {/* Footer: Category tag + Price badge */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
            {config.label}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-md border flex-shrink-0 ${getPriceBadgeStyle()}`}>
            {spot.isFree ? "Free" : spot.price}
          </span>
        </div>
      </div>
    </div>
  );
}
