"use client";

import { useState, useMemo } from "react";
import { spots, Category, neighborhoods } from "@/data/spots";
import { SpotCard } from "./SpotCard";
import { CategoryFilter } from "./CategoryFilter";

interface SpotsListProps {
  filterCategory?: Category;
  showFreeOnly?: boolean;
}

export function SpotsList({ filterCategory, showFreeOnly }: SpotsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    filterCategory || "all"
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
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

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          spot.name.toLowerCase().includes(query) ||
          spot.neighborhood.toLowerCase().includes(query) ||
          spot.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [selectedCategory, selectedNeighborhood, searchQuery, filterCategory, showFreeOnly]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search spots..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
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
      <p className="text-sm text-gray-500">{filteredSpots.length} spots</p>

      {/* Spots grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>

      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No spots found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
