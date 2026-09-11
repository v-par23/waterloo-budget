"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { spots, Category, neighborhoods, spotCoordinates } from "@/data/spots";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";

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

// Category labels for search (moved outside component for referential stability)
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

export function MapView({ filterCategory, showFreeOnly }: MapViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    filterCategory || "all"
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
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

  // Dynamic import for Leaflet (SSR compatibility)
  useEffect(() => {
    import("./LeafletMap").then((mod) => {
      setMapComponent(() => mod.LeafletMap);
    });
  }, []);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    return spots
      .filter(spot =>
        spot.name.toLowerCase().includes(query) ||
        categoryLabels[spot.category].toLowerCase().includes(query) ||
        spot.neighborhood.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [searchQuery]);

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

  // Add coordinates to filtered spots (use actual coords when available)
  const spotsWithCoords = useMemo(() => {
    return filteredSpots.map((spot) => {
      // Use actual coordinates if available
      const coords = spotCoordinates[spot.id];
      if (coords) {
        return {
          ...spot,
          lat: coords.lat,
          lng: coords.lng,
        };
      }

      // Fallback to neighborhood-based coordinates
      const baseCoords = neighborhoodCoords[spot.neighborhood] || DEFAULT_CENTER;
      // Use a deterministic offset based on spot index to avoid random during render
      const index = filteredSpots.indexOf(spot);
      const jitter = ((index % 10) - 5) * 0.0004;
      return {
        ...spot,
        lat: baseCoords[0] + jitter,
        lng: baseCoords[1] + jitter,
      };
    });
  }, [filteredSpots]);

  return (
    <div className="space-y-4">
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
            onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
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
          <div className="absolute z-1000 w-full mt-1 bg-paper border-1.5 border-ink shadow-[5px_5px_0_#1B1A17] overflow-hidden" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
            {suggestions.map((spot) => (
              <button
                key={spot.id}
                onClick={() => {
                  setSearchQuery(spot.name);
                  setShowSuggestions(false);
                  setSelectedSpotId(spot.id);
                }}
                className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 border-b border-dashed border-ink/30 last:border-0"
              >
                <span className="text-xl">{spot.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink truncate">{spot.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-ink/60">{categoryLabels[spot.category]} · {spot.neighborhood}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {voiceError && <p className="text-xs text-red-600">{voiceError}</p>}

      {/* Filters */}
      {!filterCategory && (
        <CategoryFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}

      {/* Near me */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={requestLocation}
          disabled={locating}
          className="receipt-chip-dash self-start flex items-center gap-1.5 disabled:opacity-60"
          data-active={!!location}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M10 17.5S16 12 16 8a6 6 0 1 0-12 0c0 4 6 9.5 6 9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="10" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {locating ? "LOCATING…" : location ? "LOCATION ON" : "NEAR ME"}
        </button>
        {locationError && <p className="text-xs text-red-600">{locationError}</p>}
      </div>

      {/* Neighborhood filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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

      {/* Map Container */}
      <div className="relative h-125 md:h-150 overflow-hidden border-1.5 border-ink shadow-[5px_5px_0_#1B1A17]" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
        {MapComponent ? (
          <MapComponent
            spots={spotsWithCoords}
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            onSpotSelect={setSelectedSpotId}
            selectedSpotId={selectedSpotId}
            userLocation={location}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-paper">
            <div className="text-ink/50 text-sm uppercase tracking-wide">Loading map...</div>
          </div>
        )}
      </div>

      {/* Spots count */}
      <p className="text-[11px] uppercase tracking-widest text-ink/60">
        {filteredSpots.length} spot{filteredSpots.length !== 1 ? "s" : ""} on map
      </p>
    </div>
  );
}
