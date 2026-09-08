import Link from "next/link";

import { Icon } from "@/components/icons";
import { SOCIAL } from "@/lib/nav";

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
