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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">My Saved Spots</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">My Saved Spots</h1>
        </div>
        <div className="receipt-card p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-ink/70 mb-4">Sign in to save your favorite spots</p>
          <Link href="/login" className="receipt-btn inline-flex w-auto px-4 !bg-ink !text-cream">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">My Saved Spots</h1>
        <p className="text-sm sm:text-base text-ink/70">
          {savedSpots.length} spot{savedSpots.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      <div className="receipt-divider" />

      {savedSpots.length === 0 ? (
        <div className="receipt-card p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-ink/70 mb-4">You haven&apos;t saved any spots yet</p>
          <p className="text-xs sm:text-sm text-ink/50">
            Hover over any spot and tap the &quot;Tap to save&quot; tag to save it here
          </p>
          <Link href="/" className="receipt-btn inline-flex mt-4 w-auto px-4 !bg-ink !text-cream">
            Browse Spots
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
