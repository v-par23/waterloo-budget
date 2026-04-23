"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ClassSession, UserSchedule } from "@/lib/schedule/types";

interface ScheduleContextType {
  schedule: UserSchedule;
  addClass: (classSession: Omit<ClassSession, "id">) => void;
  removeClass: (classId: string) => void;
  updateClass: (classId: string, updates: Partial<ClassSession>) => void;
  clearSchedule: () => void;
  loading: boolean;
}

const defaultSchedule: UserSchedule = {
  term: "Winter 2026",
  classes: [],
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setSchedule] = useState<UserSchedule>(defaultSchedule);
  const [loading, setLoading] = useState(true);

  // Load schedule from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("waterloo-budget-schedule");
    if (stored) {
      try {
        setSchedule(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored schedule:", e);
      }
    }
    setLoading(false);
  }, []);

  // Save schedule to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("waterloo-budget-schedule", JSON.stringify(schedule));
    }
  }, [schedule, loading]);

  const addClass = useCallback((classSession: Omit<ClassSession, "id">) => {
    const newClass: ClassSession = {
      ...classSession,
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setSchedule((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
  }, []);

  const removeClass = useCallback((classId: string) => {
    setSchedule((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== classId),
    }));
  }, []);

  const updateClass = useCallback((classId: string, updates: Partial<ClassSession>) => {
    setSchedule((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === classId ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const clearSchedule = useCallback(() => {
    setSchedule({ ...defaultSchedule, term: schedule.term });
  }, [schedule.term]);

  return (
    <ScheduleContext.Provider
      value={{
        schedule,
        addClass,
        removeClass,
        updateClass,
        clearSchedule,
        loading,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
