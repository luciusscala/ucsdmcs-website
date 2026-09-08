"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV, isActivePath } from "@/lib/nav";

/**
 * The header's links from `md` up.
 *
 * Every link carries a bottom border at all times — transparent until it's
 * hovered or current — so the rule appears without nudging the row by a pixel.
 * An external link never counts as current: it leaves the site.
 */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden flex-wrap items-center gap-x-6 gap-y-1 text-sm font-semibold text-navy md:flex"
    >
      {NAV.map((item) => {
        const active = !item.external && isActivePath(pathname, item.href);
        const className = `border-b-2 pb-0.5 transition-colors duration-200 ease-out ${
          active
            ? "border-navy"
            : "border-transparent hover:border-navy/40"
        }`;

        return item.external ? (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
