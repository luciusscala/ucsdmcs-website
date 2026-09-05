import Link from "next/link";

const NAV = [
  { href: "/schedule", label: "Schedule & Scores" },
  { href: "/standings", label: "Standings" },
  { href: "/roster", label: "Roster" },
  { href: "/tryouts", label: "Tryouts" },
  { href: "/donate", label: "Donate" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/15">
      <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="headline text-sm text-white">
            UC San Diego Men&rsquo;s Club Soccer
          </p>
          <p className="mt-1 text-xs text-white/50">
            University of California, San Diego
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/70 sm:ml-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
