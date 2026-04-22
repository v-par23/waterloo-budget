"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/ask", label: "Ask AI", emoji: "🤖" },
  { href: "/discover", label: "AI Insights", emoji: "✨" },
  { href: "/map", label: "Map", emoji: "🗺️" },
  { href: "/", label: "Spots", emoji: "📍" },
  { href: "/workspots", label: "Work Spots", emoji: "💻" },
  { href: "/transport", label: "Getting Around", emoji: "🚌" },
  { href: "/events", label: "Events", emoji: "📅" },
  { href: "/free", label: "Free", emoji: "🆓" },
  { href: "/suggest", label: "Suggest a Spot", emoji: "📝" },
];

const userNavItems = [
  { href: "/saved", label: "Saved Spots", emoji: "❤️" },
  { href: "/teams", label: "My Teams", emoji: "👥" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍁</span>
          <span className="font-bold text-xl text-gray-900">WaterlooBudget</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="text-lg">{item.emoji}</span>
            {item.label}
          </Link>
        ))}

        {/* User navigation */}
        {user && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                My Stuff
              </p>
              {userNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Auth section */}
      <div className="p-4 border-t border-gray-200">
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        ) : user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                {(user.user_metadata?.name || user.email || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.name || user.email?.split("@")[0]}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="block w-full px-4 py-2 text-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
