import Image from "next/image";
import Link from "next/link";
import { logos, logosWhite, site } from "@/lib/site";

const affiliations = [
  {
    src: logosWhite.recreation,
    alt: "UC San Diego Recreation",
    width: 542,
    height: 632,
    className: "h-11",
  },
  {
    src: logosWhite.usccs,
    alt: "US College Club Soccer",
    width: 600,
    height: 600,
    className: "h-11",
  },
  {
    src: logosWhite.nirsa,
    alt: "NIRSA Championship Series",
    width: 1200,
    height: 900,
    className: "h-12",
  },
  {
    src: logosWhite.wordmark,
    alt: "UC San Diego",
    width: 3771,
    height: 712,
    className: "h-6",
  },
];

const links = [
  { label: "Contact Us", href: `mailto:${site.email}` },
  { label: "FAQs", href: "/tryouts#faq" },
  { label: "Instagram", href: site.instagram },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-page flex flex-col items-center py-16 text-center">
        {/* Affiliations */}
        <p className="eyebrow mb-8 text-[0.625rem] text-white/35">
          Affiliations
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {affiliations.map((logo) => (
            <li key={logo.alt}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className={`${logo.className} w-auto object-contain opacity-70 transition-opacity duration-300 hover:opacity-100`}
              />
            </li>
          ))}
        </ul>

        {/* Brand */}
        <div className="mt-20 w-full text-left">
          <Link href="/" className="flex items-center gap-3.5">
            <Image
              src={logos.trident}
              alt=""
              width={900}
              height={901}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="headline text-base sm:text-lg">
              UC San Diego Men&apos;s Club Soccer
            </span>
          </Link>

          <address className="mt-4 text-xs leading-relaxed text-white/55 not-italic">
            {site.address.org}
            <br />
            {site.address.street}, {site.address.city}
          </address>

          {/* Copyright + links */}
          <div className="mt-10 flex flex-col gap-3 text-[0.6875rem] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-white/35">
              © {new Date().getFullYear()} {site.name}
            </p>
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {links.map((link, index) => (
                <li key={link.label} className="flex items-center gap-x-3">
                  {index > 0 && (
                    <span aria-hidden className="text-white/20">
                      |
                    </span>
                  )}
                  <a
                    href={link.href}
                    className="text-white/55 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
