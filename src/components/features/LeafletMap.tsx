"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon, type Marker as LeafletMarkerInstance } from "leaflet";
import { useEffect, useRef } from "react";
import { Category, categoryConfig } from "@/data/spots";
import { haversineDistanceMeters, formatDistance } from "@/lib/geo";
import { SpotReviewsSection } from "@/components/ui/SpotReviewsSection";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

import "leaflet/dist/leaflet.css";

interface SpotWithCoords {
  id: string;
  name: string;
  category: Category;
  neighborhood: string;
  price: string;
  emoji: string;
  description?: string;
  lat: number;
  lng: number;
  isFree?: boolean;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface LeafletMapProps {
  spots: SpotWithCoords[];
  center: [number, number];
  zoom: number;
  onSpotSelect: (id: string | null) => void;
  selectedSpotId: string | null;
  userLocation?: UserLocation | null;
}

// Inner SVG markup per category - raw strings (not JSX) since Leaflet's divIcon
// needs plain HTML, not a React tree. Kept visually in sync with the
// CategoryIcon component used everywhere else spots render as JSX.
const categoryMarkerPaths: Record<Category, string> = {
  food: `<circle cx="10" cy="12" r="6"/><line x1="3.5" y1="1.5" x2="3.5" y2="5.5"/><line x1="5.5" y1="1.5" x2="5.5" y2="5.5"/><line x1="7.5" y1="1.5" x2="7.5" y2="5.5"/><path d="M3.5 5.5c0 2 1.5 2.5 2 2.5s2-.5 2-2.5"/><line x1="5.5" y1="8" x2="5.5" y2="18"/><path d="M14.5 1.3L15.6 7.7H13.4Z"/><line x1="14.5" y1="7.7" x2="14.5" y2="18"/>`,
  housing: `<polyline points="4,10 10,4 16,10"/><path d="M6 9v7h8V9"/>`,
  workspots: `<rect x="4" y="5" width="12" height="8"/><line x1="2.5" y1="15" x2="17.5" y2="15"/>`,
  coffee: `<path d="M5 8h9v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8Z"/><path d="M14 9.5h1.5a2 2 0 0 1 0 4H14"/><line x1="7" y1="4" x2="7" y2="6"/><line x1="10" y1="4" x2="10" y2="6"/>`,
  gym: `<line x1="6" y1="10" x2="14" y2="10"/><rect x="3" y="7.5" width="3" height="5"/><rect x="14" y="7.5" width="3" height="5"/>`,
  bars: `<rect x="5" y="5" width="8" height="11" rx="1"/><path d="M13 7.5h1.5a2 2 0 0 1 0 4H13"/><line x1="5" y1="8.5" x2="13" y2="8.5"/>`,
  grocery: `<path d="M4 7h12l-1.5 8h-9L4 7Z"/><path d="M7 7c0-2.4 1.3-4.2 3-4.2s3 1.8 3 4.2"/>`,
};

// Category-glyph marker (replaces the old per-spot emoji, which rendered
// inconsistently across OS/browser emoji fonts and didn't match the design).
function createCategoryIcon(category: Category, isSelected: boolean) {
  const svg = `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${categoryMarkerPaths[category]}</svg>`;
  return divIcon({
    html: `<div class="dot-marker ${isSelected ? 'selected' : ''}">${svg}</div>`,
    className: "custom-emoji-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// "You are here" marker
function createUserLocationIcon() {
  return divIcon({
    html: `<div class="user-location-marker"><div class="user-location-dot"></div></div>`,
    className: "custom-user-location-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Component to handle map interactions
function MapEvents({ selectedSpotId, spots }: { selectedSpotId: string | null; spots: SpotWithCoords[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedSpotId) {
      const spot = spots.find(s => s.id === selectedSpotId);
      if (spot) {
        map.flyTo([spot.lat, spot.lng], 16, { duration: 0.5 });
      }
    }
  }, [selectedSpotId, spots, map]);

  return null;
}

// Flies the map to the user's location once it becomes available
function FlyToUserLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 0.75 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return null;
}

export function LeafletMap({ spots, center, zoom, onSpotSelect, selectedSpotId, userLocation }: LeafletMapProps) {
  const markerRefs = useRef<Record<string, LeafletMarkerInstance>>({});

  // Open the popup for spots selected via search (not just direct marker clicks)
  useEffect(() => {
    if (selectedSpotId) {
      markerRefs.current[selectedSpotId]?.openPopup();
    }
  }, [selectedSpotId]);

  return (
    <>
      <style jsx global>{`
        .custom-emoji-marker {
          background: none !important;
          border: none !important;
        }
        .emoji-marker {
          color: #1B1A17;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #FBF8F1;
          border: 1.5px solid #1B1A17;
          box-shadow: 3px 3px 0 #1B1A17;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .emoji-marker:hover {
          transform: translate(-1px, -1px);
        }
        .emoji-marker.selected {
          color: #FF5A1F;
          border-color: #FF5A1F;
          box-shadow: 3px 3px 0 #FF5A1F;
          background: #F3EFE4;
        }
        /* --- experimental pin variant (teardrop) --- */
        .pin-marker {
          width: 32px;
          height: 32px;
          background: #FBF8F1;
          border: 1.5px solid #1B1A17;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 2px 2px 0 #1B1A17;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .pin-marker:hover {
          transform: rotate(-45deg) translate(1px, -1px);
        }
        .pin-marker.selected {
          border-color: #FF5A1F;
          box-shadow: 2px 2px 0 #FF5A1F;
          background: #F3EFE4;
        }
        .pin-marker-icon {
          color: #1B1A17;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
        }
        .pin-marker.selected .pin-marker-icon {
          color: #FF5A1F;
        }
        /* --- experimental tag variant (ribbon/price-tag shape) - kept for reference, not active
        .tag-marker {
          width: 34px;
          height: 34px;
          background: #FBF8F1;
          border: 1.5px solid #1B1A17;
          clip-path: polygon(0% 0%, 100% 0%, 100% 68%, 50% 100%, 0% 68%);
          filter: drop-shadow(2px 2px 0 #1B1A17);
          color: #1B1A17;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 5px;
          transition: transform 0.15s;
        }
        .tag-marker:hover {
          transform: translate(-1px, -1px);
        }
        .tag-marker.selected {
          color: #FF5A1F;
          border-color: #FF5A1F;
          filter: drop-shadow(2px 2px 0 #FF5A1F);
        }
        --- end experimental tag variant --- */
        /* --- dot variant (minimal, inverted colors) - active --- */
        .dot-marker {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1B1A17;
          color: #F3EFE4;
          border: 1.5px solid #1B1A17;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .dot-marker:hover {
          transform: scale(1.12);
        }
        .dot-marker.selected {
          background: #FF5A1F;
          border-color: #FF5A1F;
          color: #F3EFE4;
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 0;
          padding: 0;
          background: #FBF8F1;
          border: 1.5px solid #1B1A17;
          box-shadow: 5px 5px 0 #1B1A17;
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 220px;
        }
        .leaflet-popup-tip {
          border-radius: 0;
          background: #FBF8F1;
          box-shadow: none;
        }
        .custom-user-location-marker {
          background: none !important;
          border: none !important;
        }
        .user-location-marker {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-location-dot {
          width: 14px;
          height: 14px;
          background: #FF5A1F;
          border: 3px solid #F3EFE4;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(255, 90, 31, 0.3);
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents selectedSpotId={selectedSpotId} spots={spots} />
        {userLocation && (
          <>
            <FlyToUserLocation lat={userLocation.lat} lng={userLocation.lng} />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
              interactive={false}
            />
          </>
        )}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={createCategoryIcon(spot.category, spot.id === selectedSpotId)}
            ref={(instance) => {
              if (instance) markerRefs.current[spot.id] = instance;
              else delete markerRefs.current[spot.id];
            }}
            eventHandlers={{
              click: () => onSpotSelect(spot.id),
            }}
          >
            <Popup>
              <div className="p-4 min-w-56 font-[inherit]">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#1B1A17] text-[#F3EFE4] text-[10px] font-bold tracking-widest px-2 py-1 uppercase">
                    {categoryConfig[spot.category]?.label}
                  </span>
                  <span className="font-bold text-base text-[#FF5A1F]">
                    {spot.isFree ? "Free" : spot.price}
                  </span>
                </div>
                <div className="text-lg font-bold leading-tight flex items-center gap-2 mb-1">
                  <CategoryIcon category={spot.category} className="w-4 h-4 text-[#1B1A17]/70 flex-shrink-0" />
                  <span>{spot.name}</span>
                </div>
                <p className="text-[13px] text-[#1B1A17]/55 mb-2">{spot.neighborhood}</p>
                {spot.description && (
                  <p className="text-[13px] leading-snug text-[#1B1A17]/80 mb-2">{spot.description}</p>
                )}
                {userLocation && (
                  <p className="mb-2 text-[10px] uppercase tracking-wide text-[#1B1A17]/45">
                    {formatDistance(
                      haversineDistanceMeters(userLocation.lat, userLocation.lng, spot.lat, spot.lng)
                    )} away
                  </p>
                )}
                <div style={{ height: 0, borderTop: "1.5px dashed #1B1A17", margin: "4px 0 10px" }} />
                <SpotReviewsSection
                  spotId={spot.id}
                  spotName={spot.name}
                  lat={spot.lat}
                  lng={spot.lng}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
