"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface SavedSpotsContextType {
  savedSpotIds: Set<string>;
  loading: boolean;
  toggleSave: (spotId: string) => Promise<{ error: string | null }>;
  isSpotSaved: (spotId: string) => boolean;
}

const SavedSpotsContext = createContext<SavedSpotsContextType | null>(null);

export function SavedSpotsProvider({ children }: { children: ReactNode }) {
  const [savedSpotIds, setSavedSpotIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  // Fetch saved spots on mount
  useEffect(() => {
    async function fetchSavedSpots() {
      if (!user) {
        setSavedSpotIds(new Set());
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_spots")
        .select("spot_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setSavedSpotIds(new Set(data.map((s) => s.spot_id)));
      }
      setLoading(false);
    }

    fetchSavedSpots();
  }, [user, supabase]);

  const toggleSave = useCallback(
    async (spotId: string): Promise<{ error: string | null }> => {
      if (!user) return { error: "Not logged in" };

      const isSaved = savedSpotIds.has(spotId);

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_spots")
          .delete()
          .eq("user_id", user.id)
          .eq("spot_id", spotId);

        if (!error) {
          setSavedSpotIds((prev) => {
            const next = new Set(prev);
            next.delete(spotId);
            return next;
          });
        }
        return { error: error?.message || null };
      } else {
        // Add to saved
        const { error } = await supabase.from("saved_spots").insert({
          user_id: user.id,
          spot_id: spotId,
        });

        if (!error) {
          setSavedSpotIds((prev) => new Set(prev).add(spotId));
        }
        return { error: error?.message || null };
      }
    },
    [user, savedSpotIds, supabase]
  );

  const isSpotSaved = useCallback(
    (spotId: string) => savedSpotIds.has(spotId),
    [savedSpotIds]
  );

  return (
    <SavedSpotsContext.Provider value={{ savedSpotIds, loading, toggleSave, isSpotSaved }}>
      {children}
    </SavedSpotsContext.Provider>
  );
}

export function useSavedSpots() {
  const context = useContext(SavedSpotsContext);
  if (!context) {
    throw new Error("useSavedSpots must be used within a SavedSpotsProvider");
  }
  return context;
}
