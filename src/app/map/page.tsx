import { MapView } from "@/components/features/MapView";

export default function MapPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          🗺️ Map View
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          Explore budget-friendly spots in Waterloo on the map. 
          Click on markers to see details.
        </p>
      </div>
      <MapView />
    </div>
  );
}
