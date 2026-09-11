"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon, type Marker as LeafletMarkerInstance } from "leaflet";
import { useEffect, useRef } from "react";
import { Category, categoryConfig } from "@/data/spots";
import { haversineDistanceMeters, formatDistance } from "@/lib/geo";
import { SpotReviewsSection } from "@/components/ui/SpotReviewsSection";

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

// Custom emoji marker
function createEmojiIcon(emoji: string, isSelected: boolean) {
  return divIcon({
    html: `<div class="emoji-marker ${isSelected ? 'selected' : ''}">${emoji}</div>`,
    className: "custom-emoji-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
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
          font-size: 20px;
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
          border-color: #FF5A1F;
          box-shadow: 3px 3px 0 #FF5A1F;
          background: #F3EFE4;
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
            icon={createEmojiIcon(spot.emoji, spot.id === selectedSpotId)}
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
                  <span>{spot.emoji}</span>
                  <span>{spot.name}</span>
                </div>
                <p className="text-[11px] uppercase tracking-wide text-[#1B1A17]/60 mb-2">{spot.neighborhood}</p>
                {spot.description && (
                  <p className="text-[13px] leading-snug text-[#1B1A17]/80 mb-2">{spot.description}</p>
                )}
                {userLocation && (
                  <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-wide border border-dashed border-[#1B1A17] px-2 py-1">
                    {formatDistance(
                      haversineDistanceMeters(userLocation.lat, userLocation.lng, spot.lat, spot.lng)
                    )} away
                  </span>
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
