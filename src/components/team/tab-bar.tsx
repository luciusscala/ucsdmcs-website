"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { teamPath } from "@/lib/app-host";
import { isActivePath } from "@/lib/nav";

/**
 * The app's two-tab `TabView`. Pinned to the bottom on phones, where the
 * thumb is; a plain row under the site header from `md` up.
 */
const TABS = [
  { path: "", label: "Schedule", exact: true },
  { path: "/settings", label: "Settings", exact: false },
];

/** `base` is this host's link prefix, from `teamBase()`. */
export function TabBar({ base }: { base: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Team"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/15 bg-navy pb-[env(safe-area-inset-bottom)] md:static md:border-t-0 md:bg-transparent md:pb-0"
    >
      <div className="container-page flex md:justify-start md:gap-6 md:py-3">
        {TABS.map((tab) => {
          const href = teamPath(base, tab.path);
          // Schedule owns only itself: `/settings` must not light it up.
          const active = tab.exact ? pathname === href : isActivePath(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-colors duration-200 ease-out md:flex-none md:border-b-2 md:py-1 ${
                active
                  ? "text-yellow md:border-yellow"
                  : "text-white/60 hover:text-white md:border-transparent"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
