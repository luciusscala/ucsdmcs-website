"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logos, nav, site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header>
      {/* Identity bar */}
      <div className="bg-navy">
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-blue">
              <Image
                src={logos.trident}
                alt=""
                width={900}
                height={901}
                priority
                className="h-10 w-10 object-contain"
              />
            </span>
            <span className="headline text-lg leading-[1.1] text-white sm:text-xl">
              UC San Diego
              <span className="block">Men&apos;s Club Soccer</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 sm:flex">
            <span className="eyebrow text-[0.625rem] text-white/45">
              {site.season} Season
            </span>
            <a
              href={site.instagram}
              className="eyebrow text-[0.6875rem] text-white/80 transition-colors hover:text-yellow"
            >
              Instagram
            </a>
            <a
              href={`mailto:${site.email}`}
              className="eyebrow text-[0.6875rem] text-white/80 transition-colors hover:text-yellow"
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="relative bg-yellow">
        <div className="container-page flex gap-8 overflow-x-auto sm:gap-12">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`headline shrink-0 border-b-4 py-3.5 text-base whitespace-nowrap transition-colors sm:text-lg ${
                  active
                    ? "border-navy text-navy"
                    : "border-transparent text-navy/70 hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-yellow to-transparent lg:hidden"
        />
      </nav>
    </header>
  );
}
