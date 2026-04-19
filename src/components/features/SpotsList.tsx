"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { spots, Category, neighborhoods, Spot } from "@/data/spots";
import { SpotCard } from "@/components/ui/SpotCard";
import { CategoryFilter } from "@/components/ui/CategoryFilter";

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
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (
        selectedNeighborhood !== "All" &&
        spot.neighborhood !== selectedNeighborhood
      ) {
        return false;
      }

      // Free only filter
      if (showFreeOnly && !spot.isFree) {
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
  }, [selectedCategory, selectedNeighborhood, searchQuery, filterCategory, showFreeOnly]);

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
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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

      {/* Filters */}
      {!filterCategory && (
        <CategoryFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}

      {/* Neighborhood filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {neighborhoods.map((neighborhood) => (
          <button
            key={neighborhood}
            onClick={() => setSelectedNeighborhood(neighborhood)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedNeighborhood === neighborhood
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} searchQuery={searchQuery} />
        ))}
      </div>

      {filteredSpots.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="text-4xl">🔍</div>
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
