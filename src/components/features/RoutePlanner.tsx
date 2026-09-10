"use client";

import { useMemo, useState } from "react";
import { spots, spotCoordinates } from "@/data/spots";
import { ClassSession, uwBuildings, formatTime } from "@/lib/schedule/types";
import { useSchedule } from "@/components/ScheduleProvider";
import {
  haversineDistanceMeters,
  formatDistance,
  googleMapsMultiStopUrl,
  GOOGLE_MAPS_MAX_WAYPOINTS,
} from "@/lib/geo";
import { useRoutePlan, RouteStop } from "@/lib/hooks/useRoutePlan";

interface ResolvedStop {
  stop: RouteStop;
  label: string;
  sublabel: string;
  emoji: string;
  lat: number;
  lng: number;
}

function resolveStop(stop: RouteStop, dayClasses: ClassSession[]): ResolvedStop | null {
  if (stop.kind === "spot") {
    const spot = spots.find((s) => s.id === stop.refId);
    const coords = spotCoordinates[stop.refId];
    if (!spot || !coords) return null;
    return {
      stop,
      label: spot.name,
      sublabel: spot.neighborhood,
      emoji: spot.emoji,
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  const cls = dayClasses.find((c) => c.id === stop.refId);
  if (!cls) return null;
  const building = uwBuildings[cls.building];
  return {
    stop,
    label: `${cls.courseCode} — ${cls.building} ${cls.room}`,
    sublabel: `${formatTime(cls.startTime)} – ${formatTime(cls.endTime)}`,
    emoji: "📚",
    lat: building.lat,
    lng: building.lng,
  };
}

// Rough average paces — good enough for a same-campus estimate, not turn-by-turn routing.
// Walking: ~80 m/min (4.8 km/h). Driving: ~500 m/min (30 km/h, city streets + stops/lights).
function estimateMinutes(meters: number, mode: "walking" | "driving"): number {
  const metersPerMinute = mode === "driving" ? 500 : 80;
  return Math.max(1, Math.round(meters / metersPerMinute));
}

export function RoutePlanner({ day }: { day: ClassSession["day"] }) {
  const { schedule } = useSchedule();
  const { stops, addStop, removeStop, moveStop, clearStops } = useRoutePlan(day);
  const [showAddModal, setShowAddModal] = useState(false);
  const [travelMode, setTravelMode] = useState<"walking" | "driving">("walking");

  const dayClasses = useMemo(
    () =>
      schedule.classes
        .filter((c) => c.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedule.classes, day]
  );

  const resolvedStops = useMemo(
    () => stops.map((s) => resolveStop(s, dayClasses)).filter((s): s is ResolvedStop => s !== null),
    [stops, dayClasses]
  );

  const legs = useMemo(() => {
    const result: { meters: number; minutes: number }[] = [];
    for (let i = 0; i < resolvedStops.length - 1; i++) {
      const a = resolvedStops[i];
      const b = resolvedStops[i + 1];
      const meters = haversineDistanceMeters(a.lat, a.lng, b.lat, b.lng);
      result.push({ meters, minutes: estimateMinutes(meters, travelMode) });
    }
    return result;
  }, [resolvedStops, travelMode]);

  const totalMinutes = legs.reduce((sum, l) => sum + l.minutes, 0);
  const totalMeters = legs.reduce((sum, l) => sum + l.meters, 0);

  const mapsUrl = useMemo(() => {
    if (resolvedStops.length === 0) return null;
    return googleMapsMultiStopUrl(
      resolvedStops.map((s) => ({ lat: s.lat, lng: s.lng })),
      travelMode
    );
  }, [resolvedStops, travelMode]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Build Your Route</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Chain classes and spots together in the order you want.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex-shrink-0"
        >
          + Add stop
        </button>
      </div>

      {resolvedStops.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No stops yet. Add a class or a spot to start building today&apos;s route.
        </p>
      ) : (
        <div className="space-y-1">
          {resolvedStops.map((resolved, index) => (
            <div key={resolved.stop.id}>
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-lg flex-shrink-0">{resolved.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{resolved.label}</p>
                  <p className="text-xs text-gray-500 truncate">{resolved.sublabel}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveStop(resolved.stop.id, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveStop(resolved.stop.id, "down")}
                    disabled={index === resolvedStops.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeStop(resolved.stop.id)}
                    className="p-1 text-gray-300 hover:text-red-500"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {legs[index] && (
                <div className="pl-11 py-1 flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>
                    ~{legs[index].minutes} min {travelMode === "driving" ? "drive" : "walk"} (
                    {formatDistance(legs[index].meters)})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {resolvedStops.length > 1 && (
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {resolvedStops.length} stops · ~{totalMinutes} min total{" "}
            {travelMode === "driving" ? "drive" : "walk"} ({formatDistance(totalMeters)})
          </p>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setTravelMode("walking")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  travelMode === "walking" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Walk
              </button>
              <button
                onClick={() => setTravelMode("driving")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  travelMode === "driving" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Drive
              </button>
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a66] transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                Start in Google Maps
              </a>
            )}
          </div>
        </div>
      )}

      {resolvedStops.length > GOOGLE_MAPS_MAX_WAYPOINTS + 1 && (
        <p className="text-xs text-amber-600">
          Google Maps only supports {GOOGLE_MAPS_MAX_WAYPOINTS + 1} stops per link — only the first{" "}
          {GOOGLE_MAPS_MAX_WAYPOINTS + 1} will open there.
        </p>
      )}

      {resolvedStops.length > 0 && (
        <button onClick={clearStops} className="text-xs text-gray-400 hover:text-red-500">
          Clear route
        </button>
      )}

      {showAddModal && (
        <AddStopModal
          dayClasses={dayClasses}
          existingRefIds={new Set(stops.map((s) => `${s.kind}:${s.refId}`))}
          onAdd={(kind, refId) => addStop(kind, refId)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function AddStopModal({
  dayClasses,
  existingRefIds,
  onAdd,
  onClose,
}: {
  dayClasses: ClassSession[];
  existingRefIds: Set<string>;
  onAdd: (kind: RouteStop["kind"], refId: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"spots" | "classes">("spots");
  const [search, setSearch] = useState("");

  const spotsWithCoords = useMemo(() => spots.filter((s) => spotCoordinates[s.id]), []);

  const filteredSpots = useMemo(() => {
    if (!search) return spotsWithCoords.slice(0, 20);
    const query = search.toLowerCase();
    return spotsWithCoords
      .filter((s) => s.name.toLowerCase().includes(query) || s.neighborhood.toLowerCase().includes(query))
      .slice(0, 20);
  }, [search, spotsWithCoords]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Add a stop</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-sm">
            <button
              onClick={() => setTab("spots")}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                tab === "spots" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Spots
            </button>
            <button
              onClick={() => setTab("classes")}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                tab === "classes" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Classes
            </button>
          </div>
          {tab === "spots" && (
            <input
              type="text"
              placeholder="Search spots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mt-3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tab === "spots" ? (
            filteredSpots.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No spots found</p>
            ) : (
              filteredSpots.map((spot) => {
                const added = existingRefIds.has(`spot:${spot.id}`);
                return (
                  <button
                    key={spot.id}
                    onClick={() => !added && onAdd("spot", spot.id)}
                    disabled={added}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">{spot.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{spot.name}</div>
                      <div className="text-sm text-gray-500">{spot.neighborhood}</div>
                    </div>
                    {added && <span className="text-xs text-gray-400">Added</span>}
                  </button>
                );
              })
            )
          ) : dayClasses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No classes scheduled this day</p>
          ) : (
            dayClasses.map((cls) => {
              const added = existingRefIds.has(`class:${cls.id}`);
              return (
                <button
                  key={cls.id}
                  onClick={() => !added && onAdd("class", cls.id)}
                  disabled={added}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xl">📚</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{cls.courseCode}</div>
                    <div className="text-sm text-gray-500">
                      {formatTime(cls.startTime)} – {formatTime(cls.endTime)} · {cls.building} {cls.room}
                    </div>
                  </div>
                  {added && <span className="text-xs text-gray-400">Added</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
