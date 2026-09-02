"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Media } from "@/lib/site";

const AUTOPLAY_MS = 5000;

/**
 * Auto-advancing photo carousel. Crossfades in place, so nothing shifts and
 * every photo renders at its natural size. The card is capped at 38rem because
 * the source photos are 800px wide — any wider and they start being upscaled.
 */
export function PhotoCarousel({ slides }: { slides: Media[] }) {
  const [index, setIndex] = useState(0);
  /** Bumped to restart the timer when someone picks a photo themselves. */
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const count = slides.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || count < 2) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, count, tick]);

  if (count === 0) return null;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Photos from the season"
      className="mx-auto w-full max-w-[38rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-surface ring-1 ring-border">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 680px) 608px, 100vw"
            style={{ objectPosition: slide.focus }}
            aria-hidden={i !== index}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {count > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => {
                setIndex(i);
                setTick((t) => t + 1);
              }}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index
                  ? "w-7 bg-navy"
                  : "w-3 bg-border-strong hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
