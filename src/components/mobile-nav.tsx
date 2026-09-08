"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { NAV, isActivePath } from "@/lib/nav";

/**
 * The header's links below `md`, collapsed behind a button. The panel drops
 * out of the gold bar across the full width of the viewport, so the bar itself
 * keeps a single row at every size and the crest never has to move or shrink.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  /* Tapping a link closes the panel on its own, but a back or forward gesture
     doesn't pass through that handler. Closing on the path itself covers both.
     Adjusted during render rather than in an effect, so the panel is never
     painted open on the page it just navigated to. */
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  return (
    <div ref={root} className="ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 flex size-10 items-center justify-center rounded-md text-navy transition-colors duration-200 ease-out hover:bg-navy/10"
      >
        {/* Both marks are stacked and cross-faded, so the button turns into a
            close button rather than blinking from one glyph to the other. */}
        <span className="relative size-6">
          {[
            {
              key: "bars",
              shown: !open,
              spun: "rotate-90",
              paths: (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              ),
            },
            {
              key: "close",
              shown: open,
              spun: "-rotate-90",
              paths: (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ),
            },
          ].map((glyph) => (
            <svg
              key={glyph.key}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className={`absolute inset-0 size-6 transition duration-200 ease-out ${
                glyph.shown ? "rotate-0 opacity-100" : `${glyph.spun} opacity-0`
              }`}
            >
              {glyph.paths}
            </svg>
          ))}
        </span>
      </button>

      {/* Kept mounted and collapsed to a zero-height row rather than unmounted,
          which is what lets it open and close over time instead of appearing.
          `inert` takes the closed links out of tab order and off the
          accessibility tree, the job the unmount used to do. */}
      <div
        id="mobile-nav"
        inert={!open}
        className={`absolute inset-x-0 top-full grid overflow-hidden bg-navy shadow-lg transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <nav aria-label="Primary" className="min-h-0 border-t border-white/15">
          <div className="container-page flex flex-col py-1">
            {NAV.map((item) => {
              const active = !item.external && isActivePath(pathname, item.href);
              const className = `border-b border-white/10 py-3 text-sm font-semibold transition-colors duration-200 ease-out last:border-b-0 ${
                active ? "text-yellow" : "text-white hover:text-yellow"
              }`;

              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
