"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Insight {
  title: string;
  description: string;
  emoji: string;
  spots: string[];
  type: "budget" | "time" | "study" | "social";
}

interface InsightsData {
  timeContext: {
    period: string;
    emoji: string;
    description: string;
  };
  seasonContext: {
    season: string;
    emoji: string;
  };
  insights: Insight[];
  stats: {
    totalSpots: number;
    freeSpots: number;
    categories: number;
  };
}

const typeColors: Record<string, string> = {
  budget: "bg-green-50 border-green-200 text-green-800",
  time: "bg-blue-50 border-blue-200 text-blue-800",
  study: "bg-purple-50 border-purple-200 text-purple-800",
  social: "bg-orange-50 border-orange-200 text-orange-800",
};

const typeLabels: Record<string, string> = {
  budget: "Budget Tip",
  time: "Right Now",
  study: "Study Spot",
  social: "Social",
};

interface AIInsightsProps {
  compact?: boolean;
  autoLoad?: boolean;
}

const INSIGHTS_CACHE_KEY = "ai-insights-cache-v1";
const INSIGHTS_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export function AIInsights({ compact = false, autoLoad = true }: AIInsightsProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function fetchInsights() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/insights");
      if (!response.ok) throw new Error("Failed to fetch insights");
      const insights = await response.json();
      setData(insights);
      setHasLoaded(true);
      try {
        localStorage.setItem(
          INSIGHTS_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: insights })
        );
      } catch {
        // Ignore localStorage failures.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      const cachedRaw = localStorage.getItem(INSIGHTS_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as { timestamp: number; data: InsightsData };
        if (Date.now() - cached.timestamp < INSIGHTS_CACHE_TTL_MS) {
          setData(cached.data);
          setHasLoaded(true);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache parse failures.
    }

    if (autoLoad) {
      fetchInsights();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  if (!autoLoad && !hasLoaded && !loading && !data) {
    return (
      <div className={`${compact ? "py-3" : "py-5"} px-2 sm:px-3`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">AI Insights</h3>
          <span className="text-xs text-gray-400">On demand</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Generate recommendations whenever you want a fresh set of ideas.
        </p>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Get AI Insights
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${compact ? "py-4" : "py-8"} text-center`}>
        <div className="animate-pulse">
          <p className="text-sm text-gray-500">Generating AI insights...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`${compact ? "py-4" : "py-8"} text-center text-gray-500`}>
        <p>Unable to load insights right now</p>
      </div>
    );
  }

  const displayInsights = compact ? data.insights.slice(0, 2) : data.insights;

  return (
    <div className={compact ? "" : "space-y-6"}>
      {/* Header - only show in full mode */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>{data.timeContext.emoji}</span>
              <span className="capitalize">{data.timeContext.period}</span>
              <span>•</span>
              <span>{data.seasonContext.emoji}</span>
              <span className="capitalize">{data.seasonContext.season}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600">{data.timeContext.description}</p>
          </div>
          <div className="text-left sm:text-right text-sm text-gray-400 flex sm:flex-col gap-2 sm:gap-0">
            <p>{data.stats.totalSpots} spots</p>
            <p>{data.stats.freeSpots} free</p>
          </div>
        </div>
      )}

      {/* Compact header */}
      {compact && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
          <Link href="/discover" className="text-sm text-gray-500 hover:text-gray-700">
            View all →
          </Link>
        </div>
      )}

      {/* Insights Grid */}
      <div className={`grid gap-3 sm:gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {displayInsights.map((insight, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 rounded-xl border ${typeColors[insight.type] || "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">{insight.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                  <h4 className="font-semibold text-sm sm:text-base">{insight.title}</h4>
                  <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/50">
                    {typeLabels[insight.type]}
                  </span>
                </div>
                <p className="text-xs sm:text-sm opacity-90">{insight.description}</p>
                {insight.spots.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {insight.spots.map((spot) => (
                      <span
                        key={spot}
                        className="text-xs px-1.5 sm:px-2 py-0.5 bg-white/70 rounded-full truncate max-w-[120px] sm:max-w-none"
                      >
                        {spot}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA for compact mode */}
      {compact && (
        <Link
          href="/ask"
          className="mt-3 block text-center py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Ask AI for personalized recommendations
        </Link>
      )}
    </div>
  );
}
