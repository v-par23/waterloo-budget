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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🗓️ Daily Planner</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (schedule.classes.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🗓️ Daily Planner</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your personalized day with smart spot suggestions
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-600 mb-2">No schedule yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Add your classes first to get personalized spot suggestions
          </p>
          <Link
            href="/schedule"
            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🗓️ Daily Planner</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your personalized day with smart spot suggestions
          </p>
        </div>
        <Link
          href="/schedule"
          className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base text-center"
        >
          Edit Schedule
        </Link>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekdays.map((day) => {
          const classCount = schedule.classes.filter((c) => c.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex flex-col items-center min-w-[80px] ${
                selectedDay === day
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{dayLabels[day].slice(0, 3)}</span>
              <span className="text-xs opacity-75">{classCount} classes</span>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {timelineItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-500">No classes on {dayLabels[selectedDay]}</p>
            <p className="text-sm text-gray-400 mt-1">The whole day is yours!</p>
          </div>
        ) : (
          timelineItems.map((item, index) => {
            if (item.type === "class") {
              const classData = item.data;
              return (
                <div
                  key={classData.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-2 h-12 bg-gray-900 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{classData.courseCode}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        {classData.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatTime(classData.startTime)} - {formatTime(classData.endTime)} •{" "}
                      {classData.building} {classData.room}
                    </p>
                    {classData.courseName && (
                      <p className="text-xs text-gray-400 mt-1">{classData.courseName}</p>
                    )}
                  </div>
                  <div className="text-2xl">📚</div>
                </div>
              );
            } else {
              const { gap, suggestions, description } = item.data;
              return (
                <div
                  key={`gap-${index}`}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-full min-h-[60px] bg-green-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-800 font-medium">☕ Free Time</span>
                        <span className="text-xs text-green-600">
                          {formatTime(gap.startTime)} - {formatTime(gap.endTime)}
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">{description}</p>

                      {/* Categorized Suggestions - 3 columns */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Work Spots Column */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-blue-800 uppercase tracking-wider flex items-center gap-1">
                            <span>📚</span> Study Spots
                          </p>
                          {suggestions.workSpots.map((suggestion) => {
                            const spot = spots.find((s) => s.id === suggestion.spotId);
                            if (!spot) return null;
                            return (
                              <div
                                key={suggestion.spotId}
                                className="bg-white/70 rounded-lg p-2.5 flex items-center gap-2"
                              >
                                <span className="text-lg">{spot.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {spot.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {suggestion.reason}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {suggestions.workSpots.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No spots nearby</p>
                          )}
                        </div>

                        {/* Food/Coffee Column */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-orange-800 uppercase tracking-wider flex items-center gap-1">
                            <span>🍕</span> Food & Coffee
                          </p>
                          {suggestions.foodCoffeeSpots.map((suggestion) => {
                            const spot = spots.find((s) => s.id === suggestion.spotId);
                            if (!spot) return null;
                            return (
                              <div
                                key={suggestion.spotId}
                                className="bg-white/70 rounded-lg p-2.5 flex items-center gap-2"
                              >
                                <span className="text-lg">{spot.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {spot.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {suggestion.reason}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {suggestions.foodCoffeeSpots.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No spots nearby</p>
                          )}
                        </div>

                        {/* Wellness Column (2 Gym + 1 Grocery) */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-purple-800 uppercase tracking-wider flex items-center gap-1">
                            <span>💪</span> Wellness
                          </p>
                          {suggestions.wellnessSpots.map((suggestion) => {
                            const spot = spots.find((s) => s.id === suggestion.spotId);
                            if (!spot) return null;
                            return (
                              <div
                                key={suggestion.spotId}
                                className="bg-white/70 rounded-lg p-2.5 flex items-center gap-2"
                              >
                                <span className="text-lg">{spot.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {spot.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {suggestion.reason}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {suggestions.wellnessSpots.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No spots nearby</p>
                          )}
                        </div>
                      </div>

                      {/* Building context */}
                      {gap.nearestBuilding && (
                        <p className="text-xs text-green-600 mt-3">
                          📍 Near {uwBuildings[gap.nearestBuilding].name}
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

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">📊 Day Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{dayClasses.length}</p>
            <p className="text-xs text-gray-500">Classes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{gapsWithSuggestions.length}</p>
            <p className="text-xs text-gray-500">Free Periods</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(
                gapsWithSuggestions.reduce((acc, g) => acc + g.gap.durationMinutes, 0) / 60
              )}h
            </p>
            <p className="text-xs text-gray-500">Free Time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {gapsWithSuggestions.reduce((acc, g) => 
                acc + g.suggestions.workSpots.length + g.suggestions.foodCoffeeSpots.length + g.suggestions.wellnessSpots.length, 
              0)}
            </p>
            <p className="text-xs text-gray-500">Suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
