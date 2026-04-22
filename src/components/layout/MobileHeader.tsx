"use client";

import { useState } from "react";
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

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🍁</span>
          <span className="font-bold text-lg text-gray-900">WaterlooBudget</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      {isOpen && (
        <nav className="px-4 py-2 bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                pathname === item.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600"
              }`}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}

          {/* User navigation */}
          {user && (
            <>
              <div className="my-2 border-t border-gray-100"></div>
              <p className="px-3 py-1 text-xs font-medium text-gray-400 uppercase">
                My Stuff
              </p>
              {userNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </Link>
              ))}
            </>
          )}

          {/* Auth section */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            {loading ? (
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {(user.user_metadata?.name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-3 text-center bg-gray-900 text-white rounded-lg text-sm font-medium"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
