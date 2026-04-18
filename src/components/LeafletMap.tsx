"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, divIcon } from "leaflet";
import { useEffect } from "react";
import { categoryConfig, Category } from "@/data/spots";

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

interface LeafletMapProps {
  spots: SpotWithCoords[];
  center: [number, number];
  zoom: number;
  onSpotSelect: (id: string | null) => void;
  selectedSpotId: string | null;
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

export function LeafletMap({ spots, center, zoom, onSpotSelect, selectedSpotId }: LeafletMapProps) {
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
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={createEmojiIcon(spot.emoji, spot.id === selectedSpotId)}
            eventHandlers={{
              click: () => onSpotSelect(spot.id),
            }}
          >
            <Popup>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{spot.emoji}</span>
                  <span className="font-semibold text-gray-900">{spot.name}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{spot.neighborhood}</p>
                {spot.description && (
                  <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{spot.price}</span>
                  {spot.isFree && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Free</span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
