"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/", label: "Spots" },
  { href: "/map", label: "Map" },
  { href: "/planner", label: "Planner" },
  { href: "/events", label: "Events" },
  { href: "/ask", label: "Ask AI" },
  { href: "/free", label: "Free" },
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
    <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex items-center h-14 px-5 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-0">
          <span className="font-bold text-lg">
            <span className="text-gray-900">Waterloo</span>
            <span className="text-[#1D9E75]">Budget</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-[#1D9E75]/10 text-[#1D9E75]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
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
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-[#1D9E75]/10 text-[#1D9E75]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Auth section */}
      <div className="p-3 border-t border-gray-200">
        {loading ? (
          <div className="h-9 bg-gray-100 rounded-lg animate-pulse"></div>
        ) : user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-7 h-7 bg-[#1D9E75]/10 rounded-full flex items-center justify-center text-xs font-medium text-[#1D9E75]">
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
              className="w-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="block w-full px-3 py-2 text-center bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a66] transition-colors text-sm font-medium"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
