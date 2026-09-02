import Image from "next/image";
import Link from "next/link";
import { logos, nav, site } from "@/lib/site";

const affiliations = [
  {
    src: logos.recreation,
    alt: "UC San Diego Recreation",
    width: 542,
    height: 632,
    className: "h-16",
  },
  {
    src: logos.usccs,
    alt: "US College Club Soccer",
    width: 600,
    height: 600,
    className: "h-14",
  },
  {
    src: logos.nirsa,
    alt: "NIRSA Championship Series",
    width: 1200,
    height: 900,
    className: "h-20",
  },
  {
    src: logos.wordmark,
    alt: "UC San Diego",
    width: 3771,
    height: 712,
    className: "h-7",
  },
];

export function SiteFooter() {
  return (
    <footer>
      {/* Affiliations */}
      <div className="border-t border-border bg-background py-16">
        <div className="container-page">
          <p className="eyebrow mb-12 text-center text-[0.6875rem] text-muted">
            Affiliations
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-20 gap-y-14">
            {affiliations.map((logo) => (
              <li key={logo.alt}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className={`${logo.className} w-auto object-contain opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Site footer */}
      <div className="bg-navy text-white">
        <div className="container-page py-16">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr] md:gap-16">
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-blue">
                  <Image
                    src={logos.trident}
                    alt=""
                    width={900}
                    height={901}
                    className="h-10 w-10 object-contain"
                  />
                </span>
                <span className="headline text-lg leading-[1.15] sm:text-xl">
                  UC San Diego
                  <span className="block">Men&apos;s Club Soccer</span>
                </span>
              </div>
              <dl className="mt-8 space-y-2 text-sm text-white/70">
                <div className="flex gap-2">
                  <dt className="sr-only">League</dt>
                  <dd>{site.league}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="sr-only">Home venue</dt>
                  <dd>{site.homeVenue}</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="eyebrow text-[0.6875rem] text-yellow">Team</p>
              <ul className="mt-5 space-y-3 text-sm">
                {nav
                  .filter((item) => item.href !== "/")
                  .map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-white/75 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow text-[0.6875rem] text-yellow">Contact</p>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="break-words text-white/75 transition-colors hover:text-white"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <a
                    href={site.instagram}
                    className="text-white/75 transition-colors hover:text-white"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <Link
                    href="/#tryouts"
                    className="text-white/75 transition-colors hover:text-white"
                  >
                    Tryouts
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {site.name}
            </p>
            <p>
              A registered student organization at the University of California
              San Diego.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
