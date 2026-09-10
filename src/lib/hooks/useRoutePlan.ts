"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClassSession } from "@/lib/schedule/types";

export interface RouteStop {
  id: string; // stable instance id, distinct from refId (a spot/class can appear once)
  kind: "spot" | "class";
  refId: string; // spot.id or ClassSession.id
}

const STORAGE_KEY_PREFIX = "waterloo-budget-route-";

function loadStops(day: ClassSession["day"]): RouteStop[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${day}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Manages an ordered chain of stops (spots + classes) for a given day, persisted to
// localStorage — same lightweight, client-only persistence approach as ScheduleProvider.
export function useRoutePlan(day: ClassSession["day"]) {
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStops(loadStops(day));
    setLoaded(true);
  }, [day]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${day}`, JSON.stringify(stops));
  }, [day, stops, loaded]);

  const addStop = useCallback((kind: RouteStop["kind"], refId: string) => {
    setStops((prev) => [
      ...prev,
      { id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, kind, refId },
    ]);
  }, []);

  const removeStop = useCallback((id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveStop = useCallback((id: string, direction: "up" | "down") => {
    setStops((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }, []);

  const clearStops = useCallback(() => setStops([]), []);

  return { stops, addStop, removeStop, moveStop, clearStops, loaded };
}
