import Image from "next/image";
import type { Media } from "@/lib/site";

/**
 * Half photo, half navy panel. The photo is capped at roughly half the
 * viewport so our source images render close to 1:1 instead of being
 * upscaled across a full-bleed banner.
 */
export function SplitHero({
  media,
  eyebrow,
  title,
  titleAccent,
  size = "page",
  priority = false,
  children,
}: {
  media: Media;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  size?: "page" | "hero";
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const hero = size === "hero";

  return (
    <section className="relative bg-navy text-white">
      <div className="grid lg:grid-cols-2">
        <div
          className={`pad-gutter-l order-2 flex flex-col justify-center py-12 pr-5 lg:order-1 lg:py-16 lg:pr-14 ${
            hero ? "lg:py-20" : ""
          }`}
        >
          {eyebrow && <p className="eyebrow text-yellow">{eyebrow}</p>}
          <h1
            className={`headline mt-3 ${
              hero ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
            }`}
          >
            {title}
            {titleAccent && (
              <span className="mt-1 block text-yellow">{titleAccent}</span>
            )}
          </h1>
          {children}
        </div>

        <div
          className={`relative order-1 lg:order-2 ${
            hero ? "h-56 sm:h-80 lg:h-[30rem]" : "h-48 sm:h-64 lg:h-[24rem]"
          }`}
        >
          <Image
            src={media.src}
            alt={media.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 50vw, 100vw"
            style={{ objectPosition: media.focus }}
            className="object-cover"
          />
          {/* Feather the photo into the navy panel on wide screens */}
          <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-navy to-transparent lg:block" />
        </div>
      </div>
      <div className="h-1.5 bg-yellow" />
    </section>
  );
}
