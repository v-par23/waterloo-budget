"use client";

import { useEffect, useState, useMemo } from "react";
import { spots, Category, neighborhoods, categoryConfig } from "@/data/spots";
import { CategoryFilter } from "./CategoryFilter";

// Neighborhood coordinates for Waterloo/Kitchener area
const neighborhoodCoords: Record<string, [number, number]> = {
  "UW Campus": [43.4723, -80.5449],
  "University Plaza": [43.4721, -80.5387],
  "Uptown Waterloo": [43.4643, -80.5204],
  "Downtown Kitchener": [43.4516, -80.4925],
  "Lester St": [43.4743, -80.5320],
  "Northdale": [43.4789, -80.5270],
  "Kitchener": [43.4516, -80.4925],
  "Various": [43.4643, -80.5204],
  "Virtual": [43.4643, -80.5204],
};

// Default center: University of Waterloo
const DEFAULT_CENTER: [number, number] = [43.4723, -80.5449];
const DEFAULT_ZOOM = 14;

interface MapViewProps {
  filterCategory?: Category;
  showFreeOnly?: boolean;
}

export function MapView({ filterCategory, showFreeOnly }: MapViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    filterCategory || "all"
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Dynamic import for Leaflet (SSR compatibility)
  useEffect(() => {
    // @ts-ignore - Dynamic import works at runtime
    import("./LeafletMap").then((mod) => {
      setMapComponent(() => mod.LeafletMap);
    });
  }, []);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (selectedCategory !== "all" && spot.category !== selectedCategory) {
        return false;
      }
      if (filterCategory && spot.category !== filterCategory) {
        return false;
      }
      if (selectedNeighborhood !== "All" && spot.neighborhood !== selectedNeighborhood) {
        return false;
      }
      if (showFreeOnly && !spot.isFree) {
        return false;
      }
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

  // Add coordinates to filtered spots
  const spotsWithCoords = useMemo(() => {
    return filteredSpots.map((spot, index) => {
      const baseCoords = neighborhoodCoords[spot.neighborhood] || DEFAULT_CENTER;
      // Add slight offset for each spot in the same neighborhood to prevent overlap
      const offset = index * 0.0005;
      const jitter = (Math.random() - 0.5) * 0.003;
      return {
        ...spot,
        lat: baseCoords[0] + offset * Math.cos(index) + jitter,
        lng: baseCoords[1] + offset * Math.sin(index) + jitter,
      };
    });
  }, [filteredSpots]);

  const selectedSpot = selectedSpotId 
    ? spotsWithCoords.find(s => s.id === selectedSpotId) 
    : null;

  return (
    <div className="space-y-4">
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
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {neighborhood}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative h-125 md:h-150 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
        {MapComponent ? (
          <MapComponent
            spots={spotsWithCoords}
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            onSpotSelect={setSelectedSpotId}
            selectedSpotId={selectedSpotId}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading map...</div>
          </div>
        )}

        {/* Selected spot info panel */}
        {selectedSpot && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-lg p-4 z-1000">
            <button
              onClick={() => setSelectedSpotId(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{selectedSpot.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{selectedSpot.name}</h3>
                <p className="text-sm text-gray-500">{selectedSpot.neighborhood}</p>
                {selectedSpot.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedSpot.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig[selectedSpot.category]?.color || "bg-gray-100"}`}>
                    {categoryConfig[selectedSpot.category]?.label}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{selectedSpot.price}</span>
                  {selectedSpot.isFree && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Free
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spots count */}
      <p className="text-sm text-gray-500">
        {filteredSpots.length} spot{filteredSpots.length !== 1 ? "s" : ""} on map
      </p>
    </div>
  );
}
