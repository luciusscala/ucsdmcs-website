import Link from "next/link";

import { Icon } from "@/components/icons";
import { SOCIAL } from "@/lib/nav";

/**
 * The bodies the club competes under and the campus department it sits in.
 *
 * `flip` marks a single-colour lockup, which is inverted to white — the whole
 * mark is one ink on transparent, so a white version loses nothing (the
 * trident's slashes are holes in the artwork, not white pixels). The USCCS
 * badge is deliberately left alone: it's a filled, multi-colour crest, so the
 * same treatment would flatten it into a plain white disc, and a badge with
 * its own gold ring already reads on a dark ground.
 *
 * Heights are tuned per mark rather than shared. A single height would be the
 * wrong call twice over: the NIRSA wordmark is wide and short, and the
 * Recreation lockup carries internal whitespace that the dense USCCS badge
 * doesn't, so matching their boxes leaves the trident looking undersized.
 */
const AFFILIATIONS = [
  {
    src: "/logos/reclogo.png",
    alt: "UC San Diego Recreation",
    width: 542,
    height: 632,
    flip: true,
    className: "h-13 w-auto sm:h-15",
  },
  {
    src: "/logos/nirsalogo.svg",
    alt: "NIRSA",
    width: 180,
    height: 98,
    flip: true,
    className: "h-8 w-auto sm:h-9",
  },
  {
    src: "/logos/usccslogo.png",
    alt: "US College Club Soccer",
    width: 600,
    height: 600,
    flip: false,
    className: "h-12 w-auto sm:h-14",
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="container-page flex flex-col gap-8 py-9 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <div className="min-w-0">
          <p className="headline text-sm text-white">
            UC San Diego Men&rsquo;s Club Soccer
          </p>
          <p className="mt-1 text-xs text-white/60">
            &copy; {new Date().getFullYear()} University of California, San
            Diego
          </p>

          {/* Links and icon buttons carry inner padding, so the row is pulled
              out by that much to hang off the same edge as the two lines
              above it. */}
          <div className="-mx-2 mt-3 flex items-center gap-1">
            <Link
              href="/contact"
              className="rounded-md px-2 py-1 text-sm text-white/70 transition hover:text-white"
            >
              Contact
            </Link>
            <Link
              href="/faq"
              className="rounded-md px-2 py-1 text-sm text-white/70 transition hover:text-white"
            >
              FAQ
            </Link>

            <span aria-hidden="true" className="mx-2 h-4 w-px bg-white/20" />

            {SOCIAL.map((account) => (
              <a
                key={account.label}
                href={account.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={account.label}
                className="flex size-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name={account.label} className="size-[19px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
