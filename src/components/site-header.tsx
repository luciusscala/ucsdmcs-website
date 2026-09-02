"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logos, nav } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const activeIndex = nav.findIndex((item) => isActive(pathname, item.href));

  /** Item the underline is currently pointing at: hovered/focused one, else active. */
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [underline, setUnderline] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const target = previewIndex ?? activeIndex;

  // Measure the target link so the underline can slide to it. Re-measures on
  // resize and web-font swap, both of which change the link's width. Runs in an
  // effect rather than a layout effect so it stays inert during SSR; nothing is
  // rendered until a measurement exists, so there is no flash of a stray bar.
  useEffect(() => {
    const el = target >= 0 ? itemRefs.current[target] : null;
    if (!el) {
      setUnderline(null);
      return;
    }

    const measure = () =>
      setUnderline({ left: el.offsetLeft, width: el.offsetWidth });
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <header>
      {/* Identity bar — the trident, nothing else */}
      <div className="bg-navy">
        <div className="container-page flex h-[4.5rem] items-center">
          <Link href="/" aria-label="UC San Diego Men's Club Soccer — home">
            <Image
              src={logos.trident}
              alt=""
              width={900}
              height={901}
              priority
              className="h-12 w-12 object-contain"
            />
          </Link>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="relative bg-yellow">
        <div className="container-page">
          <div
            ref={listRef}
            className="relative flex gap-6 overflow-x-auto sm:gap-9"
            onMouseLeave={() => setPreviewIndex(null)}
          >
            {nav.map((item, index) => {
              const active = index === activeIndex;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setPreviewIndex(index)}
                  onFocus={() => setPreviewIndex(index)}
                  onBlur={() => setPreviewIndex(null)}
                  className={`eyebrow shrink-0 py-3.5 text-[0.6875rem] whitespace-nowrap transition-colors duration-200 ${
                    active ? "text-navy" : "text-navy/60 hover:text-navy"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {underline && (
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-[3px] bg-navy transition-[transform,width] duration-300 ease-out"
                style={{
                  transform: `translateX(${underline.left}px)`,
                  width: underline.width,
                }}
              />
            )}
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-yellow to-transparent lg:hidden"
        />
      </nav>
    </header>
  );
}
