"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { NAV } from "@/lib/nav";

/**
 * The header's links below `md`, collapsed behind a button. The panel drops
 * out of the gold bar across the full width of the viewport, so the bar itself
 * keeps a single row at every size and the crest never has to move or shrink.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  /* Escape, or a tap anywhere off the menu, closes it. Nothing to bind while
     it's shut, so the listeners only exist for as long as the panel does. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={root} className="ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 flex size-10 items-center justify-center rounded-md text-navy transition hover:bg-navy/10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="size-6"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-t border-white/15 bg-navy shadow-lg"
        >
          <div className="container-page flex flex-col py-1">
            {NAV.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="border-b border-white/10 py-3 text-sm font-semibold text-white last:border-b-0"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/10 py-3 text-sm font-semibold text-white last:border-b-0"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
