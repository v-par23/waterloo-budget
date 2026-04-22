"use client";

import { AIInsights } from "@/components/features/AIInsights";
import Link from "next/link";

export default function DiscoverPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>✨</span> AI Insights
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Smart recommendations powered by AI, tailored to your time and budget
        </p>
      </div>

      {/* AI Insights */}
      <AIInsights compact={false} />

      {/* Additional Features */}
      <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Ask AI Card */}
        <Link
          href="/ask"
          className="p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl text-white hover:from-gray-800 hover:to-gray-700 transition-all"
        >
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🤖</div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Ask AI Anything</h3>
          <p className="text-gray-300 text-xs sm:text-sm">
            Get personalized recommendations by describing exactly what you&apos;re looking for
          </p>
        </Link>

        {/* Suggest Spot Card */}
        <Link
          href="/suggest"
          className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl sm:rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all"
        >
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📝</div>
          <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-1 sm:mb-2">Know a Hidden Gem?</h3>
          <p className="text-green-700 text-xs sm:text-sm">
            Help fellow students by suggesting a budget-friendly spot we&apos;re missing
          </p>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl">
        <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Quick Tips for Students</h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">✓</span>
            <span><strong>PAC/CIF gym</strong> is included in your student fees - no extra cost!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">✓</span>
            <span><strong>DC Library</strong> is open 24/7 during exam season with free printing credits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">✓</span>
            <span><strong>Velocity</strong> and <strong>GreenHouse</strong> offer free co-working for UW students</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">✓</span>
            <span>Most Plaza restaurants have student discounts - just ask!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
