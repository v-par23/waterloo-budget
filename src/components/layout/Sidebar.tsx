"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/", label: "Spots" },
  { href: "/map", label: "Map" },
  { href: "/planner", label: "Planner" },
  { href: "/ask", label: "Ask AI" },
  { href: "/budget", label: "Budget Tracker" },
  { href: "/suggest", label: "Suggest a Spot" },
];

const userNavItems = [
  { href: "/schedule", label: "My Schedule" },
  { href: "/saved", label: "Saved" },
  { href: "/teams", label: "Teams" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-cream border-r-2 border-ink">
      <div className="flex items-center justify-between h-16 px-5 border-b-2 border-ink">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight">WATERLOO</span>
          <span className="text-[15px] font-bold tracking-tight">BUDGET</span>
        </Link>
        <svg width="26" height="26" viewBox="0 0 34 34" fill="none">
          <path d="M7 4h20v24l-3-2-3 2-3-2-3 2-3-2-3 2-2-2Z" stroke="#1B1A17" strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="11" y1="11" x2="23" y2="11" stroke="#1B1A17" strokeWidth="1.4" />
          <line x1="11" y1="15.5" x2="23" y2="15.5" stroke="#1B1A17" strokeWidth="1.4" />
          <line x1="11" y1="20" x2="18" y2="20" stroke="#1B1A17" strokeWidth="1.4" />
        </svg>
      </div>
      <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-1.5 transition-colors ${
              pathname === item.href
                ? "bg-ink text-cream border-ink"
                : "border-ink/0 text-ink/70 hover:border-ink hover:text-ink"
            }`}
            style={{ borderWidth: "1.5px", borderStyle: "solid" }}
          >
            {item.label}
          </Link>
        ))}

        {user && (
          <div className="pt-5 mt-5 border-t border-dashed border-ink/40">
            <p className="px-3 text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-2">
              My Stuff
            </p>
            {userNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-1.5 transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-ink text-cream border-ink"
                    : "border-ink/0 text-ink/70 hover:border-ink hover:text-ink"
                }`}
                style={{ borderWidth: "1.5px", borderStyle: "solid" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t-2 border-ink">
        {loading ? (
          <div className="h-9 border border-dashed border-ink/40 animate-pulse" />
        ) : user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-6 h-6 border-1.5 border-ink flex items-center justify-center text-[10px] font-bold" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
                {(user.user_metadata?.name || user.email || "U")[0].toUpperCase()}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wide truncate">
                {user.user_metadata?.name || user.email?.split("@")[0]}
              </p>
            </div>
            <button
              onClick={signOut}
              className="w-full receipt-btn text-left justify-start px-3"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/login" className="receipt-btn w-full !bg-ink !text-cream">
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
