import Image from "next/image";
import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { NAV } from "@/lib/nav";

export function SiteHeader() {
  return (
    /* Raised so the crest, which is taller than the gold bar, can overhang
       onto the navy above and below without being clipped by page content. */
    <header className="relative z-20">
      {/* Navy rule above the gold bar; the crest overhangs onto it. */}
      <div className="h-5 bg-navy" />

      {/* Positioned so the mobile menu can drop out of the bar's bottom edge. */}
      <div className="relative bg-yellow">
        <div className="container-page flex min-h-11 items-center gap-x-6 py-1.5">
          {/* 72px crest in a 44px bar: -my-3.5 lets it break out top and bottom.
              `relative` keeps it painted over the open mobile menu, so it
              overhangs that panel the same way it overhangs the navy rule. */}
          <Link
            href="/"
            className="relative z-10 -my-3.5 shrink-0"
            aria-label="Home"
          >
            <Image
              src="/logos/ucsdtridentlogo.png"
              alt=""
              width={88}
              height={88}
              className="size-18 drop-shadow-sm"
              priority
            />
          </Link>

          {/* The links themselves from md up; below that they live in the
              dropdown, which keeps the bar to one row at every width. */}
          <nav className="hidden flex-wrap items-center gap-x-6 gap-y-1 text-sm font-semibold text-navy md:flex">
            {NAV.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:opacity-70"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:opacity-70"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
