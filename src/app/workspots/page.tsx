import { SpotsList } from "@/components/features/SpotsList";

export default function WorkSpotsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          💻 Work Spots
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          Libraries, coworking spaces, cafes, and places to get work done in Waterloo.
        </p>
      </div>
      <SpotsList filterCategory="workspots" />
    </div>
  );
}
