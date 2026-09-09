"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon, type Marker as LeafletMarkerInstance } from "leaflet";
import { useEffect, useRef } from "react";
import { Category, categoryConfig } from "@/data/spots";
import { haversineDistanceMeters, formatDistance, googleMapsDirectionsUrl } from "@/lib/geo";

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
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .emoji-marker:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .emoji-marker.selected {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          border: 3px solid #3b82f6;
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 200px;
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
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
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
              <div className="p-3 min-w-52">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{spot.emoji}</span>
                  <span className="font-semibold text-gray-900">{spot.name}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{spot.neighborhood}</p>
                {spot.description && (
                  <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[spot.category]?.color || "bg-gray-100"}`}>
                    {categoryConfig[spot.category]?.label}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{spot.price}</span>
                  {spot.isFree && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Free</span>
                  )}
                  {userLocation && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      📍 {formatDistance(
                        haversineDistanceMeters(userLocation.lat, userLocation.lng, spot.lat, spot.lng)
                      )}
                    </span>
                  )}
                </div>
                <a
                  href={googleMapsDirectionsUrl(spot.lat, spot.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  🧭 Get directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
