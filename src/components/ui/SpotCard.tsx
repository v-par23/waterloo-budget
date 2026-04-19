"use client";

import { Spot } from "@/data/spots";
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
  const priceIndicator = spot.isFree
    ? "Free"
    : "$".repeat(Math.max(1, spot.priceLevel));

  const { user } = useAuth();
  const { isSpotSaved, toggleSave } = useSavedSpots();
  const router = useRouter();
  const isSaved = isSpotSaved(spot.id);

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer relative group">
      {showSaveButton && (
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
          title={isSaved ? "Remove from saved" : "Save spot"}
        >
          {isSaved ? (
            <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      )}
      <div className="flex items-start justify-between pr-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{spot.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{highlightMatch(spot.name, searchQuery)}</h3>
            <p className="text-sm text-gray-500">
              {highlightMatch(spot.neighborhood, searchQuery)} · {spot.price}
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            spot.isFree
              ? "bg-green-100 text-green-700"
              : spot.priceLevel <= 1
              ? "bg-green-50 text-green-600"
              : spot.priceLevel === 2
              ? "bg-yellow-50 text-yellow-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {priceIndicator}
        </span>
      </div>
      {spot.description && (
        <p className="text-sm text-gray-600 mt-2 ml-11">{spot.description}</p>
      )}
    </div>
  );
}
