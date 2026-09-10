"use client";

import { useEffect } from "react";
import { Spot, spots, spotCoordinates, categoryConfig, vibeConfig } from "@/data/spots";
import { googleMapsDirectionsUrl, formatDistance } from "@/lib/geo";
import { useSpotReviews } from "@/lib/hooks/useSpotReviews";

interface CompareModalProps {
  spotIds: string[];
  distances?: Record<string, number>;
  onClose: () => void;
  onRemove: (spotId: string) => void;
}

export function CompareModal({ spotIds, distances, onClose, onRemove }: CompareModalProps) {
  const resolved = spotIds
    .map((id) => spots.find((s) => s.id === id))
    .filter((s): s is Spot => Boolean(s));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compare spots</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {resolved.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No spots selected. Close this and pick some from the list.
            </p>
          ) : (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `120px repeat(${resolved.length}, minmax(180px, 1fr))` }}
            >
              {/* Header row */}
              <div />
              {resolved.map((spot) => (
                <div key={spot.id} className="text-center space-y-1">
                  <button
                    onClick={() => onRemove(spot.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                    title="Remove from comparison"
                  >
                    ✕ Remove
                  </button>
                  <div className="text-2xl">{spot.emoji}</div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{spot.name}</p>
                </div>
              ))}

              <CompareRow
                label="Category"
                spots={resolved}
                render={(spot) => (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryConfig[spot.category].color}`}>
                    {categoryConfig[spot.category].label}
                  </span>
                )}
              />

              <CompareRow
                label="Cuisine / type"
                spots={resolved}
                render={(spot) => <span className="text-sm text-gray-700">{spot.cuisine ?? "—"}</span>}
              />

              <CompareRow
                label="Price"
                spots={resolved}
                render={(spot) => (
                  <span className="text-sm text-gray-700">{spot.isFree ? "Free" : spot.price}</span>
                )}
              />

              <CompareRow
                label="Location"
                spots={resolved}
                render={(spot) => <span className="text-sm text-gray-700">{spot.neighborhood}</span>}
              />

              <CompareRow
                label="Distance"
                spots={resolved}
                render={(spot) => {
                  const d = distances?.[spot.id];
                  return (
                    <span className="text-sm text-gray-700">
                      {typeof d === "number" ? formatDistance(d) : "—"}
                    </span>
                  );
                }}
              />

              <CompareRow
                label="Typical vibe"
                hint="Estimate, not live data"
                spots={resolved}
                render={(spot) => (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${
                      spot.vibe ? vibeConfig[spot.vibe].color : "border-gray-100 text-gray-400"
                    }`}
                  >
                    {spot.vibe ? `${vibeConfig[spot.vibe].emoji} ${vibeConfig[spot.vibe].label}` : "—"}
                  </span>
                )}
              />

              <CompareRow
                label="Rating"
                spots={resolved}
                render={(spot) => <RatingCell spotId={spot.id} name={spot.name} />}
              />

              <CompareRow
                label="Directions"
                spots={resolved}
                render={(spot) => {
                  const coords = spotCoordinates[spot.id];
                  if (!coords) return <span className="text-sm text-gray-400">—</span>;
                  return (
                    <a
                      href={googleMapsDirectionsUrl(coords.lat, coords.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      🧭 Directions
                    </a>
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  hint,
  spots: rowSpots,
  render,
}: {
  label: string;
  hint?: string;
  spots: Spot[];
  render: (spot: Spot) => React.ReactNode;
}) {
  return (
    <>
      <div className="text-xs font-medium text-gray-500 py-2.5 border-t border-gray-100 flex items-start">
        <span>
          {label}
          {hint && <span className="block text-[10px] text-gray-400 font-normal">{hint}</span>}
        </span>
      </div>
      {rowSpots.map((spot) => (
        <div key={spot.id} className="py-2.5 border-t border-gray-100 text-center flex items-center justify-center">
          {render(spot)}
        </div>
      ))}
    </>
  );
}

function RatingCell({ spotId, name }: { spotId: string; name: string }) {
  const { data, loading, fetchReviews } = useSpotReviews();
  const coords = spotCoordinates[spotId];

  useEffect(() => {
    if (coords) fetchReviews(spotId, name, coords.lat, coords.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  if (!coords) return <span className="text-sm text-gray-400">—</span>;
  if (loading) return <span className="text-xs text-gray-400">Loading…</span>;
  if (data?.rating) {
    return (
      <span className="text-sm text-gray-700">
        ⭐ {data.rating} ({data.reviewCount})
      </span>
    );
  }
  return <span className="text-sm text-gray-400">No Yelp listing</span>;
}
