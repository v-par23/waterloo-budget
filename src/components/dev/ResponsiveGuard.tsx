"use client";

import { useEffect, useState } from "react";

interface Offender {
  tag: string;
  className: string;
  overflowPx: number;
}

// Walks every element and reports the ones whose right edge sits past the viewport.
// Sorted smallest-first: the smallest offending element is usually the actual culprit
// (a wide child), while its ancestors show up too but are just carrying the overflow.
function findOffenders(): Offender[] {
  const vw = window.innerWidth;
  const offenders: Offender[] = [];
  document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.right > vw + 1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === "string" ? el.className.slice(0, 100) : "",
        overflowPx: Math.round(rect.right - vw),
      });
    }
  });
  return offenders.sort((a, b) => a.overflowPx - b.overflowPx).slice(0, 5);
}

// Dev-only watchdog: warns loudly (console + on-screen banner) whenever the page
// renders wider than the viewport, which is how phone-width layout bugs like a
// `grid` missing its base `grid-cols-*` slip through when only tested on desktop.
export function ResponsiveGuard() {
  const [overflowPx, setOverflowPx] = useState<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      if (overflow > 2) {
        setOverflowPx(overflow);
        console.error(
          `[ResponsiveGuard] Page is ${overflow}px wider than the viewport (${window.innerWidth}px). ` +
            `Usually a "grid"/"flex" row missing a base (mobile-first) column or width class. Likely offenders:`,
          findOffenders()
        );
      } else {
        setOverflowPx(null);
      }
    };

    // setTimeout (not requestAnimationFrame) so this still fires reliably even on a
    // backgrounded/hidden tab, where rAF callbacks are suspended by the browser.
    const scheduleCheck = () => {
      clearTimeout(timer);
      timer = setTimeout(check, 150);
    };

    scheduleCheck();
    window.addEventListener("resize", scheduleCheck);
    const observer = new MutationObserver(scheduleCheck);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", scheduleCheck);
      observer.disconnect();
    };
  }, []);

  if (process.env.NODE_ENV === "production" || overflowPx == null) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        left: 8,
        right: 8,
        zIndex: 999999,
        background: "#ff5a1f",
        color: "#1b1a17",
        fontFamily: "monospace",
        fontSize: 11,
        fontWeight: 700,
        padding: "8px 12px",
        border: "2px solid #1b1a17",
        boxShadow: "4px 4px 0 #1b1a17",
      }}
    >
      ⚠ Horizontal overflow: page is {overflowPx}px wider than the screen — see console for the offending element. (dev-only)
    </div>
  );
}
