const EARTH_RADIUS_METERS = 6371e3;

// Haversine formula: great-circle distance between two lat/lng points, in meters.
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Opens Google Maps turn-by-turn directions to the given point. Omitting the
// origin makes Google Maps default to the visitor's current location.
export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${lat},${lng}`,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

// Google's free web Directions URL reliably supports the destination plus up to
// this many waypoints (any more and Maps silently drops/ignores the rest).
export const GOOGLE_MAPS_MAX_WAYPOINTS = 9;

// Opens Google Maps with a full multi-stop route: origin defaults to the visitor's
// current location (same as googleMapsDirectionsUrl), the last point is the
// destination, and everything in between becomes ordered waypoints. Only the first
// GOOGLE_MAPS_MAX_WAYPOINTS + 1 stops are included — Maps doesn't support more via
// this free URL scheme.
export function googleMapsMultiStopUrl(
  stops: { lat: number; lng: number }[],
  travelMode: "walking" | "driving" = "walking"
): string {
  const capped = stops.slice(0, GOOGLE_MAPS_MAX_WAYPOINTS + 1);
  const destination = capped[capped.length - 1];
  const waypoints = capped.slice(0, -1);

  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: travelMode,
  });
  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.map((s) => `${s.lat},${s.lng}`).join("|"));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
