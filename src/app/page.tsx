import { SpotsList } from "@/components/features/SpotsList";
import { AIInsights } from "@/components/features/AIInsights";
import { spots } from "@/data/spots";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          <span className="text-gray-900">Waterloo</span>
          <span className="text-[#1D9E75]">Budget</span>
        </h1>
        <p className="text-gray-600 max-w-xl">
          Curated spots for students, founders, and builders in Canada&apos;s tech hub.
          Food, coffee, work spaces, and more.
        </p>
        <p className="text-sm text-gray-400">
          {spots.length} spots · Waterloo, ON
        </p>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
        <AIInsights compact={true} autoLoad={false} />
      </div>
      
      <SpotsList />
    </div>
  );
}
