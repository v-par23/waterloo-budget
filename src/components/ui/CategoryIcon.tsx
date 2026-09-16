import { Category } from "@/data/spots";

// Simple line-icon per category, replacing per-spot emoji as the map/card
// marker glyph. Renders identically across every OS/browser (unlike emoji,
// which vary by platform's emoji font) and stays on the ink/cream palette.
const categoryPaths: Record<Category, React.ReactNode> = {
  food: (
    <>
      <circle cx="10" cy="11" r="6" />
      <line x1="3.5" y1="2" x2="3.5" y2="6" />
      <line x1="5.5" y1="2" x2="5.5" y2="6" />
      <line x1="7.5" y1="2" x2="7.5" y2="6" />
      <path d="M3.5 6c0 2 1.5 2.5 2 2.5s2-.5 2-2.5" />
      <line x1="5.5" y1="8.5" x2="5.5" y2="18.5" />
      <ellipse cx="14.5" cy="5.2" rx="2.2" ry="3.2" />
      <line x1="14.5" y1="8.4" x2="14.5" y2="18.5" />
    </>
  ),
  housing: (
    <>
      <polyline points="4,10 10,4 16,10" />
      <path d="M6 9v7h8V9" />
    </>
  ),
  workspots: (
    <>
      <rect x="4" y="5" width="12" height="8" />
      <line x1="2.5" y1="15" x2="17.5" y2="15" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 8h9v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8Z" />
      <path d="M14 9.5h1.5a2 2 0 0 1 0 4H14" />
      <line x1="7" y1="4" x2="7" y2="6" />
      <line x1="10" y1="4" x2="10" y2="6" />
    </>
  ),
  gym: (
    <>
      <line x1="6" y1="10" x2="14" y2="10" />
      <rect x="3" y="7.5" width="3" height="5" />
      <rect x="14" y="7.5" width="3" height="5" />
    </>
  ),
  bars: (
    <>
      <rect x="5" y="5" width="8" height="11" rx="1" />
      <path d="M13 7.5h1.5a2 2 0 0 1 0 4H13" />
      <line x1="5" y1="8.5" x2="13" y2="8.5" />
    </>
  ),
  grocery: (
    <>
      <path d="M4 7h12l-1.5 8h-9L4 7Z" />
      <path d="M7 7c0-2.4 1.3-4.2 3-4.2s3 1.8 3 4.2" />
    </>
  ),
};

export function CategoryIcon({ category, className = "w-4 h-4" }: { category: Category; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {categoryPaths[category]}
    </svg>
  );
}
