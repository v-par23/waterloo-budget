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

export function SpotsList({ filterCategory }: SpotsListProps) {
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
          placeholder="SEARCH SPOTS, CATEGORY, LOCATION..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-3 pl-10 pr-10 bg-transparent border-0 border-b-2 border-ink text-sm uppercase tracking-wide placeholder:text-ink/50 focus:outline-none"
        />
        <svg
          className="absolute left-1 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-ink"
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
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink/60 hover:text-ink"
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
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                isListening ? "text-accent animate-pulse" : "text-ink/60 hover:text-ink"
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
          <div className="absolute z-50 w-full mt-1 bg-paper border-1.5 border-ink shadow-[5px_5px_0_#1B1A17] overflow-hidden" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
            {suggestions.map((spot) => (
              <button
                key={spot.id}
                onClick={() => handleSuggestionClick(spot)}
                className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 border-b border-dashed border-ink/30 last:border-0"
              >
                <span className="text-xl">{spot.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink truncate">{spot.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-ink/60">{categoryLabels[spot.category]} · {spot.neighborhood}</p>
                </div>
                <span className="text-sm font-bold text-accent">{spot.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {locationError && <p className="text-xs text-red-600">{locationError}</p>}
      {voiceError && <p className="text-xs text-red-600">{voiceError}</p>}

      {/* Filters */}
      {!filterCategory && (
        <CategoryFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}

      {/* Near me + Compare */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={handleNearMeClick}
          disabled={locating}
          className="receipt-chip-dash flex items-center gap-1.5 disabled:opacity-60"
          data-active={sortByDistance && !!location}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M10 17.5S16 12 16 8a6 6 0 1 0-12 0c0 4 6 9.5 6 9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="10" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {locating ? "LOCATING…" : sortByDistance && location ? "SORTED BY DISTANCE" : "NEAR ME"}
        </button>
        <button
          onClick={handleToggleCompareMode}
          className="receipt-chip-dash flex items-center gap-1.5"
          data-active={compareMode}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6.2 5.8 3.5 10.3a2.7 2.7 0 0 0 5.4 0L6.2 5.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M13.8 5.8 11.1 10.3a2.7 2.7 0 0 0 5.4 0l-2.7-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <line x1="6.2" y1="5.8" x2="13.8" y2="5.8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {compareMode ? "COMPARING" : "COMPARE"}
        </button>
      </div>

      {/* Neighborhood filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {neighborhoods.map((neighborhood) => (
          <button
            key={neighborhood}
            onClick={() => setSelectedNeighborhood(neighborhood)}
            className="receipt-chip-dash"
            data-active={selectedNeighborhood === neighborhood}
          >
            {neighborhood.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="receipt-divider-dash" />

      {/* Results count */}
      <p className="text-[11px] uppercase tracking-widest text-ink/60">
        {filteredSpots.length} {filteredSpots.length === 1 ? 'spot' : 'spots'}
        {searchQuery && ` for "${searchQuery}"`}
      </p>

      {/* Spots grid */}
      <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 ${compareMode ? "pb-20" : ""}`}>
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
          <div className="bg-ink text-cream border-1.5 border-ink shadow-[5px_5px_0_#FF5A1F] px-4 py-2.5 flex items-center gap-3" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
              {compareIds.length > 0 && (
                <>
                  <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                    {compareIds.length} / {MAX_COMPARE} selected
                  </span>
                  <button
                    onClick={() => setCompareIds([])}
                    className="text-xs font-bold uppercase text-cream/60 hover:text-cream"
                  >
                    Clear
                  </button>
                </>
              )}

              <div className="relative" ref={filtersRef}>
                <button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap text-accent hover:text-cream"
                >
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
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
                  <div className="absolute z-40 bottom-full mb-3 right-0 w-72 receipt-card p-4 space-y-4 text-ink">
                    {availableCuisines.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1.5">Cuisine</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedCuisine("all")}
                            className="receipt-chip-dash"
                            data-active={selectedCuisine === "all"}
                          >
                            Any
                          </button>
                          {availableCuisines.map((cuisine) => (
                            <button
                              key={cuisine}
                              onClick={() => setSelectedCuisine(cuisine)}
                              className="receipt-chip-dash"
                              data-active={selectedCuisine === cuisine}
                            >
                              {cuisine}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1.5">Price</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedPriceLevel("all")}
                          className="receipt-chip-dash"
                          data-active={selectedPriceLevel === "all"}
                        >
                          Any
                        </button>
                        {priceLevels.map(({ level, label }) => (
                          <button
                            key={level}
                            onClick={() => setSelectedPriceLevel(level)}
                            className="receipt-chip-dash"
                            data-active={selectedPriceLevel === level}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1.5">Typical vibe</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedVibe("all")}
                          className="receipt-chip-dash"
                          data-active={selectedVibe === "all"}
                        >
                          Any
                        </button>
                        {(Object.keys(vibeConfig) as VibeLevel[]).map((vibe) => (
                          <button
                            key={vibe}
                            onClick={() => setSelectedVibe(vibe)}
                            className="receipt-chip-dash"
                            data-active={selectedVibe === vibe}
                          >
                            {vibeConfig[vibe].label}
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
                        className="text-[11px] font-bold uppercase text-ink/50 hover:text-accent"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {compareIds.length > 0 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  disabled={compareIds.length < 2}
                  className="receipt-btn !border-cream !text-cream disabled:opacity-40 disabled:cursor-not-allowed px-3"
                >
                  Compare
                </button>
              )}
          </div>
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
        <div className="text-center py-12 space-y-4 border-1.5 border-dashed border-ink/40" style={{ borderWidth: "1.5px" }}>
          <p className="text-sm uppercase tracking-wide text-ink/60">No spots found matching your criteria.</p>
          {searchQuery && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-ink/40">Try searching for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["coffee", "food", "gym", "free", "UW Plaza"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="receipt-chip-dash"
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
