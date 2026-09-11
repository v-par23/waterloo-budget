"use client";

import { useState } from "react";
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

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-cream border-b-2 border-ink z-50">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-[13px] font-bold tracking-tight">WATERLOO</span>
          <span className="text-[13px] font-bold tracking-tight">BUDGET</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-ink"
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
        <nav className="px-4 py-3 bg-cream border-t border-dashed border-ink/40 max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider ${
                pathname === item.href
                  ? "bg-ink text-cream"
                  : "text-ink/70"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <>
              <div className="my-2 border-t border-dashed border-ink/40"></div>
              <p className="px-3 py-1 text-[10px] font-bold text-ink/50 uppercase tracking-widest">
                My Stuff
              </p>
              {userNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider ${
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-ink text-cream"
                      : "text-ink/70"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}

          <div className="mt-2 pt-2 border-t border-dashed border-ink/40">
            {loading ? (
              <div className="h-10 border border-dashed border-ink/40 animate-pulse"></div>
            ) : user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-7 h-7 border-1.5 border-ink flex items-center justify-center text-xs font-bold" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
                    {(user.user_metadata?.name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <p className="text-sm font-bold uppercase tracking-wide truncate">
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full receipt-btn text-left justify-start px-3"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="receipt-btn w-full !bg-ink !text-cream"
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
