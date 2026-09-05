import Image from "next/image";
import Link from "next/link";

const NAV = [
  { href: "/schedule", label: "Schedule" },
  { href: "/roster", label: "Roster" },
];

export function SiteHeader() {
  return (
    /* Raised so the crest, which is taller than the gold bar, can overhang
       onto the navy above and below without being clipped by page content. */
    <header className="relative z-20">
      {/* Navy rule above the gold bar; the crest overhangs onto it. */}
      <div className="h-6 bg-navy" />

      <div className="bg-yellow">
        <div className="container-page flex h-14 items-center gap-5">
          {/* 88px crest in a 56px bar: -my-4 lets it break out top and bottom. */}
          <Link href="/" className="-my-4 shrink-0" aria-label="Home">
            <Image
              src="/logos/ucsdtridentlogo.png"
              alt=""
              width={88}
              height={88}
              className="size-22 drop-shadow-sm"
              priority
            />
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold text-navy">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:opacity-70"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
