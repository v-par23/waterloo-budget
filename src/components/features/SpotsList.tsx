"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { spots, Category, neighborhoods, Spot, spotCoordinates, VibeLevel, vibeConfig } from "@/data/spots";
import { SpotCard } from "@/components/ui/SpotCard";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { CompareModal } from "@/components/features/CompareModal";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { haversineDistanceMeters } from "@/lib/geo";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";

const MAX_COMPARE = 4;
const priceLevels = [
  { level: 1, label: "$" },
  { level: 2, label: "$$" },
  { level: 3, label: "$$$" },
  { level: 4, label: "$$$$" },
];

interface SpotsListProps {
  filterCategory?: Category;
  showFreeOnly?: boolean;
}

// Category display names for search
const categoryLabels: Record<Category, string> = {
  food: "Food",
  housing: "Housing",
  workspots: "Work Spots",
  coffee: "Coffee",
  accelerators: "Accelerators",
  gym: "Gym",
  bars: "Bars",
  grocery: "Grocery",
};

// Fuzzy matching helper - returns score (higher is better match)
function fuzzyMatch(str: string, query: string): number {
  str = str.toLowerCase();
  query = query.toLowerCase();

  // Exact match gets highest score
  if (str === query) return 100;

  // Contains gets high score
  if (str.includes(query)) return 80;

  // Check each word
  const words = str.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(query)) return 70;
  }

  // Fuzzy character matching
  let queryIndex = 0;
  let score = 0;
  for (let i = 0; i < str.length && queryIndex < query.length; i++) {
    if (str[i] === query[queryIndex]) {
      score += 10;
      queryIndex++;
    }
  }

  return queryIndex === query.length ? score : 0;
}

export function SpotsList({ filterCategory, showFreeOnly }: SpotsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    filterCategory || "all"
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | "all">("all");
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<number | "all">("all");
  const [selectedVibe, setSelectedVibe] = useState<VibeLevel | "all">("all");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const { location, loading: locating, error: locationError, requestLocation } = useUserLocation();
  const {
    isSupported: voiceSupported,
    isListening,
    error: voiceError,
    startListening,
  } = useSpeechRecognition((text) => {
    setSearchQuery(text);
    setShowSuggestions(true);
  });

  // Distance (in meters) from the user to each spot with known coordinates
  const distances = useMemo(() => {
    if (!location) return {} as Record<string, number>;
    const map: Record<string, number> = {};
    for (const spot of spots) {
      const coords = spotCoordinates[spot.id];
      if (coords) {
        map[spot.id] = haversineDistanceMeters(location.lat, location.lng, coords.lat, coords.lng);
      }
    }
    return map;
  }, [location]);

  const handleNearMeClick = () => {
    if (!location) {
      requestLocation();
    }
    setSortByDistance((prev) => !location ? true : !prev);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close the filters dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const matches: { spot: Spot; score: number }[] = [];

    for (const spot of spots) {
      const nameScore = fuzzyMatch(spot.name, query);
      const categoryScore = fuzzyMatch(categoryLabels[spot.category], query) * 0.5;
      const neighborhoodScore = fuzzyMatch(spot.neighborhood, query) * 0.7;
      const descScore = spot.description ? fuzzyMatch(spot.description, query) * 0.3 : 0;

      const totalScore = Math.max(nameScore, categoryScore, neighborhoodScore, descScore);
      if (totalScore > 0) {
        matches.push({ spot, score: totalScore });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(m => m.spot);
  }, [searchQuery]);

  const filteredSpots = useMemo(() => {
    const result = spots.filter((spot) => {
      // Category filter
      if (selectedCategory !== "all" && spot.category !== selectedCategory) {
        return false;
      }

      // Pre-set category filter (for specific pages)
      if (filterCategory && spot.category !== filterCategory) {
        return false;
      }

      // Neighborhood filter
      if (selectedNeighborhood !== "All") {
        const spotNeighborhoods = spot.neighborhood
          .split(",")
          .map((n) => n.trim());
        if (!spotNeighborhoods.includes(selectedNeighborhood)) {
          return false;
        }
      }

      // Free only filter
      if (showFreeOnly && !spot.isFree) {
        return false;
      }

      // Cuisine / type filter
      if (selectedCuisine !== "all" && spot.cuisine !== selectedCuisine) {
        return false;
      }

      // Price level filter
      if (selectedPriceLevel !== "all" && spot.priceLevel !== selectedPriceLevel) {
        return false;
      }

      // Typical vibe filter
      if (selectedVibe !== "all" && spot.vibe !== selectedVibe) {
        return false;
      }

      // Search filter with fuzzy matching
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = fuzzyMatch(spot.name, query);
        const categoryMatch = fuzzyMatch(categoryLabels[spot.category], query);
        const neighborhoodMatch = fuzzyMatch(spot.neighborhood, query);
        const descMatch = spot.description ? fuzzyMatch(spot.description, query) : 0;
        const priceMatch = spot.price?.toLowerCase().includes(query) ? 50 : 0;

        return Math.max(nameMatch, categoryMatch, neighborhoodMatch, descMatch, priceMatch) > 0;
      }

      return true;
    });

    // Sort by distance when "Near Me" is active (spots with no known location sink to the end)
    if (sortByDistance && location) {
      result.sort((a, b) => {
        const distA = distances[a.id] ?? Infinity;
        const distB = distances[b.id] ?? Infinity;
        return distA - distB;
      });
      return result;
    }

    // Sort by relevance if searching
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result.sort((a, b) => {
        const scoreA = Math.max(
          fuzzyMatch(a.name, query),
          fuzzyMatch(categoryLabels[a.category], query) * 0.5,
          fuzzyMatch(a.neighborhood, query) * 0.7
        );
        const scoreB = Math.max(
          fuzzyMatch(b.name, query),
          fuzzyMatch(categoryLabels[b.category], query) * 0.5,
          fuzzyMatch(b.neighborhood, query) * 0.7
        );
        return scoreB - scoreA;
      });
    }

    return result;
  }, [
    selectedCategory,
    selectedNeighborhood,
    searchQuery,
    filterCategory,
    showFreeOnly,
    selectedCuisine,
    selectedPriceLevel,
    selectedVibe,
    sortByDistance,
    location,
    distances,
  ]);

  // Cuisine options scoped to whatever's currently visible via category/neighborhood,
  // so the pill list doesn't show tags with zero matching spots.
  const availableCuisines = useMemo(() => {
    const scoped = spots.filter((spot) => {
      if (selectedCategory !== "all" && spot.category !== selectedCategory) return false;
      if (filterCategory && spot.category !== filterCategory) return false;
      return true;
    });
    return Array.from(new Set(scoped.map((s) => s.cuisine).filter((c): c is string => Boolean(c)))).sort();
  }, [selectedCategory, filterCategory]);

  const handleToggleCompare = (spotId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(spotId)) return prev.filter((id) => id !== spotId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, spotId];
    });
  };

  const handleToggleCompareMode = () => {
    setCompareMode((prev) => {
      if (prev) {
        setCompareIds([]);
        setShowFilters(false);
        setSelectedCuisine("all");
        setSelectedPriceLevel("all");
        setSelectedVibe("all");
      }
      return !prev;
    });
  };

  const activeFilterCount =
    (selectedCuisine !== "all" ? 1 : 0) +
    (selectedPriceLevel !== "all" ? 1 : 0) +
    (selectedVibe !== "all" ? 1 : 0);

  const handleSuggestionClick = (spot: Spot) => {
    setSearchQuery(spot.name);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative" ref={searchRef}>
        <input
          type="text"
          placeholder="Search by name, category, location..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-3 pl-10 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery ? (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          voiceSupported && (
            <button
              onClick={startListening}
              title="Search by voice"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                isListening ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          )
        )}

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && searchQuery.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((spot) => (
              <button
                key={spot.id}
                onClick={() => handleSuggestionClick(spot)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-xl">{spot.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{spot.name}</p>
                  <p className="text-xs text-gray-500">{categoryLabels[spot.category]} · {spot.neighborhood}</p>
                </div>
                <span className="text-sm text-gray-400">{spot.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {locationError && <p className="text-xs text-red-500">{locationError}</p>}
      {voiceError && <p className="text-xs text-red-500">{voiceError}</p>}

      {/* Filters */}
      {!filterCategory && (
        <CategoryFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}

      {/* Near me + Compare */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={handleNearMeClick}
          disabled={locating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-60 ${
            sortByDistance && location
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📍 {locating ? "Locating…" : sortByDistance && location ? "Sorted by distance" : "Near me"}
        </button>
        <button
          onClick={handleToggleCompareMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            compareMode ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ⚖️ {compareMode ? "Comparing" : "Compare"}
        </button>
      </div>

      {/* Neighborhood filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {neighborhoods.map((neighborhood) => (
          <button
            key={neighborhood}
            onClick={() => setSelectedNeighborhood(neighborhood)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedNeighborhood === neighborhood
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            {neighborhood}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filteredSpots.length} {filteredSpots.length === 1 ? 'spot' : 'spots'}
        {searchQuery && ` for "${searchQuery}"`}
      </p>

      {/* Spots grid */}
      <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${compareMode ? "pb-20" : ""}`}>
        {filteredSpots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            searchQuery={searchQuery}
            distanceMeters={distances[spot.id]}
            compareMode={compareMode}
            isCompareSelected={compareIds.includes(spot.id)}
            compareDisabled={compareIds.length >= MAX_COMPARE}
            onToggleCompare={handleToggleCompare}
          />
        ))}
      </div>

      {/* Floating compare bar */}
      {compareMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          <div className="relative" ref={filtersRef}>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-lg transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-[#1D9E75] text-white"
                  : "bg-gray-900 text-gray-200 hover:bg-gray-800"
              }`}
            >
              🔧 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              <svg
                className={`w-3 h-3 transition-transform ${showFilters ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFilters && (
              <div className="absolute z-40 bottom-full mb-2 left-0 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4">
                {availableCuisines.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Cuisine</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedCuisine("all")}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedCuisine === "all"
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        }`}
                      >
                        Any
                      </button>
                      {availableCuisines.map((cuisine) => (
                        <button
                          key={cuisine}
                          onClick={() => setSelectedCuisine(cuisine)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                            selectedCuisine === cuisine
                              ? "bg-gray-800 text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                          }`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Price</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedPriceLevel("all")}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedPriceLevel === "all"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                      }`}
                    >
                      Any
                    </button>
                    {priceLevels.map(({ level, label }) => (
                      <button
                        key={level}
                        onClick={() => setSelectedPriceLevel(level)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedPriceLevel === level
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Typical vibe</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedVibe("all")}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedVibe === "all"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                      }`}
                    >
                      Any
                    </button>
                    {(Object.keys(vibeConfig) as VibeLevel[]).map((vibe) => (
                      <button
                        key={vibe}
                        onClick={() => setSelectedVibe(vibe)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedVibe === vibe
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        }`}
                      >
                        {vibeConfig[vibe].emoji} {vibeConfig[vibe].label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCuisine("all");
                      setSelectedPriceLevel("all");
                      setSelectedVibe("all");
                    }}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {compareIds.length > 0 && (
            <div className="bg-gray-900 text-white rounded-full shadow-lg px-4 py-2.5 flex items-center gap-3">
              <span className="text-sm font-medium whitespace-nowrap">
                {compareIds.length} / {MAX_COMPARE} selected
              </span>
              <button
                onClick={() => setCompareIds([])}
                className="text-xs text-gray-300 hover:text-white"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCompareModal(true)}
                disabled={compareIds.length < 2}
                className="px-3 py-1.5 bg-[#1D9E75] rounded-full text-sm font-medium hover:bg-[#178a66] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Compare
              </button>
            </div>
          )}
        </div>
      )}

      {showCompareModal && (
        <CompareModal
          spotIds={compareIds}
          distances={distances}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => setCompareIds((prev) => prev.filter((s) => s !== id))}
        />
      )}

      {filteredSpots.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-500">No spots found matching your criteria.</p>
          {searchQuery && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Try searching for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["coffee", "food", "gym", "free", "UW Plaza"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
