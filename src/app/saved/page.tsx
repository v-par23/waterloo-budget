"use client";

import { useMemo } from "react";
import { spots } from "@/data/spots";
import { SpotCard } from "@/components/ui/SpotCard";
import { useSavedSpots } from "@/components/SavedSpotsProvider";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function SavedPage() {
  const { savedSpotIds, loading } = useSavedSpots();
  const { user, loading: authLoading } = useAuth();

  const savedSpots = useMemo(() => {
    return spots.filter((spot) => savedSpotIds.has(spot.id));
  }, [savedSpotIds]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">❤️ My Saved Spots</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">❤️ My Saved Spots</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-4">Sign in to save your favorite spots</p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">❤️ My Saved Spots</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {savedSpots.length} spot{savedSpots.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {savedSpots.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-4">You haven&apos;t saved any spots yet</p>
          <p className="text-xs sm:text-sm text-gray-500">
            Hover over any spot and click the heart icon to save it here
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
          >
            Browse Spots
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
