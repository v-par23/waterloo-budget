import { SpotsList } from "@/components/features/SpotsList";
import { AIInsights } from "@/components/features/AIInsights";

export default function Home() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          🍁 WaterlooBudget
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          A curated guide to budget-friendly spots in Waterloo, Ontario. 
          Perfect for students, founders, and anyone building in Canada&apos;s tech hub.
        </p>
      </div>
      
      {/* AI Insights Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
        <AIInsights compact={true} />
      </div>
      
      <SpotsList />
    </div>
  );
}
