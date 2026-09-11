import { SpotsList } from "@/components/features/SpotsList";
import { AIInsights } from "@/components/features/AIInsights";
import { spots } from "@/data/spots";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="text-ink">Waterloo</span>
          <span className="text-accent">Budget</span>
        </h1>
        <p className="text-ink/70 max-w-xl">
          Curated spots for students, founders, and builders in Canada&apos;s tech hub.
          Food, coffee, work spaces, and more.
        </p>
        <p className="text-[11px] uppercase tracking-widest text-ink/50">
          {spots.length} spots · Waterloo, ON
        </p>
      </div>

      <div className="receipt-divider" />

      {/* AI Insights Section */}
      <div className="receipt-card p-4">
        <AIInsights compact={true} autoLoad={false} />
      </div>

      <SpotsList />
    </div>
  );
}
