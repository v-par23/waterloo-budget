"use client";

import { useMemo, useState } from "react";
import { useSchedule } from "@/components/ScheduleProvider";
import { spots } from "@/data/spots";
import {
  ClassSession,
  weekdays,
  dayLabels,
  formatTime,
  uwBuildings,
} from "@/lib/schedule/types";
import {
  findTimeGaps,
  getCategorizedSuggestionsForGap,
  getGapDescription,
} from "@/lib/schedule/suggestions";
import { RoutePlanner } from "@/components/features/RoutePlanner";
import Link from "next/link";

export default function PlannerPage() {
  const { schedule, loading } = useSchedule();
  const [selectedDay, setSelectedDay] = useState<ClassSession["day"]>(() => {
    // Default to today if it's a weekday
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) {
      return weekdays[today - 1];
    }
    return "monday";
  });

  // Get classes for selected day
  const dayClasses = useMemo(() => {
    return schedule.classes
      .filter((c) => c.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedule.classes, selectedDay]);

  // Find gaps and get suggestions
  const gapsWithSuggestions = useMemo(() => {
    const gaps = findTimeGaps(schedule.classes, selectedDay);
    return gaps.map((gap) => ({
      gap,
      suggestions: getCategorizedSuggestionsForGap(gap),
      description: getGapDescription(gap),
    }));
  }, [schedule.classes, selectedDay]);

  // Build timeline items (classes + gaps interleaved)
  const timelineItems = useMemo(() => {
    const items: Array<
      | { type: "class"; data: ClassSession }
      | { type: "gap"; data: typeof gapsWithSuggestions[0] }
    > = [];

    let gapIndex = 0;
    let classIndex = 0;

    // Interleave gaps and classes based on time
    while (gapIndex < gapsWithSuggestions.length || classIndex < dayClasses.length) {
      const nextGap = gapsWithSuggestions[gapIndex];
      const nextClass = dayClasses[classIndex];

      if (!nextClass) {
        // Only gaps left
        items.push({ type: "gap", data: nextGap });
        gapIndex++;
      } else if (!nextGap) {
        // Only classes left
        items.push({ type: "class", data: nextClass });
        classIndex++;
      } else if (nextGap.gap.startTime < nextClass.startTime) {
        items.push({ type: "gap", data: nextGap });
        gapIndex++;
      } else {
        items.push({ type: "class", data: nextClass });
        classIndex++;
      }
    }

    return items;
  }, [dayClasses, gapsWithSuggestions]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Daily Planner</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
        </div>
      </div>
    );
  }

  if (schedule.classes.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Daily Planner</h1>
          <p className="text-sm sm:text-base text-ink/70">
            Your personalized day with smart spot suggestions
          </p>
        </div>

        {/* Route Planner still works without any classes — pure spot-to-spot chains */}
        <RoutePlanner day={selectedDay} />

        <div className="receipt-card p-6 sm:p-8 text-center">
          <p className="text-ink/80 mb-2">No schedule yet</p>
          <p className="text-sm text-ink/50 mb-4">
            Add your classes to include them in your route and get personalized spot suggestions
          </p>
          <Link href="/schedule" className="receipt-btn inline-flex w-auto px-4 !bg-ink !text-cream">
            Add Your Schedule
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Daily Planner</h1>
          <p className="text-sm sm:text-base text-ink/70">
            Your personalized day with smart spot suggestions
          </p>
        </div>
        <Link href="/schedule" className="receipt-btn w-auto px-4">
          Edit Schedule
        </Link>
      </div>

      <div className="receipt-divider" />

      {/* Day Selector */}
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {weekdays.map((day) => {
          const classCount = schedule.classes.filter((c) => c.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="receipt-chip flex flex-col items-center min-w-[80px] normal-case"
              data-active={selectedDay === day}
            >
              <span className="uppercase">{dayLabels[day].slice(0, 3)}</span>
              <span className="text-[10px] opacity-75 normal-case">{classCount} classes</span>
            </button>
          );
        })}
      </div>

      {/* Route Planner */}
      <RoutePlanner day={selectedDay} />

      {/* Timeline */}
      <div className="space-y-4">
        {timelineItems.length === 0 ? (
          <div className="receipt-card p-6 text-center">
            <p className="text-ink/70">No classes on {dayLabels[selectedDay]}</p>
            <p className="text-sm text-ink/40 mt-1">The whole day is yours!</p>
          </div>
        ) : (
          timelineItems.map((item, index) => {
            if (item.type === "class") {
              const classData = item.data;
              return (
                <div key={classData.id} className="receipt-card p-4 flex items-center gap-4">
                  <div className="w-1.5 self-stretch bg-ink flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-ink">{classData.courseCode}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border border-ink/30">
                        {classData.type}
                      </span>
                    </div>
                    <p className="text-sm text-ink/60">
                      {formatTime(classData.startTime)} - {formatTime(classData.endTime)} •{" "}
                      {classData.building} {classData.room}
                    </p>
                    {classData.courseName && (
                      <p className="text-xs text-ink/40 mt-1">{classData.courseName}</p>
                    )}
                  </div>
                </div>
              );
            } else {
              const { gap, suggestions, description } = item.data;
              return (
                <div key={`gap-${index}`} className="receipt-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-1.5 self-stretch min-h-[60px] bg-accent flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-ink font-bold uppercase tracking-wide text-sm">Free Time</span>
                        <span className="text-xs text-accent font-bold">
                          {formatTime(gap.startTime)} - {formatTime(gap.endTime)}
                        </span>
                      </div>
                      <p className="text-sm text-ink/70 mb-3">{description}</p>

                      {/* Categorized Suggestions - 3 columns */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Work Spots Column */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-ink/60 uppercase tracking-widest">
                            Study Spots
                          </p>
                          {suggestions.workSpots.map((suggestion) => {
                            const spot = spots.find((s) => s.id === suggestion.spotId);
                            if (!spot) return null;
                            return (
                              <div
                                key={suggestion.spotId}
                                className="border border-dashed border-ink/30 p-2.5 flex items-center gap-2"
                              >
                                <span className="text-lg">{spot.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-ink text-sm truncate">
                                    {spot.name}
                                  </p>
                                  <p className="text-xs text-ink/50 truncate">
                                    {suggestion.reason}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {suggestions.workSpots.length === 0 && (
                            <p className="text-xs text-ink/40 italic">No spots nearby</p>
                          )}
                        </div>

                        {/* Food/Coffee Column */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-ink/60 uppercase tracking-widest">
                            Food & Coffee
                          </p>
                          {suggestions.foodCoffeeSpots.map((suggestion) => {
                            const spot = spots.find((s) => s.id === suggestion.spotId);
                            if (!spot) return null;
                            return (
                              <div
                                key={suggestion.spotId}
                                className="border border-dashed border-ink/30 p-2.5 flex items-center gap-2"
                              >
                                <span className="text-lg">{spot.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-ink text-sm truncate">
                                    {spot.name}
                                  </p>
                                  <p className="text-xs text-ink/50 truncate">
                                    {suggestion.reason}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {suggestions.foodCoffeeSpots.length === 0 && (
                            <p className="text-xs text-ink/40 italic">No spots nearby</p>
                          )}
                        </div>

                        {/* Wellness Column (2 Gym + 1 Grocery) */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-ink/60 uppercase tracking-widest">
                            Wellness
                          </p>
                          {suggestions.wellnessSpots.map((suggestion) => {
                            const spot = spots.find((s) => s.id === suggestion.spotId);
                            if (!spot) return null;
                            return (
                              <div
                                key={suggestion.spotId}
                                className="border border-dashed border-ink/30 p-2.5 flex items-center gap-2"
                              >
                                <span className="text-lg">{spot.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-ink text-sm truncate">
                                    {spot.name}
                                  </p>
                                  <p className="text-xs text-ink/50 truncate">
                                    {suggestion.reason}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {suggestions.wellnessSpots.length === 0 && (
                            <p className="text-xs text-ink/40 italic">No spots nearby</p>
                          )}
                        </div>
                      </div>

                      {/* Building context */}
                      {gap.nearestBuilding && (
                        <p className="text-xs text-accent mt-3">
                          Near {gap.nearestBuilding} ({uwBuildings[gap.nearestBuilding].name})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>

    </div>
  );
}
