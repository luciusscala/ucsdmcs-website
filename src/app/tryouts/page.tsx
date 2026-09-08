import type { Metadata } from "next";
import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";
import {
  TEAM_EMAIL,
  TRYOUTS,
  TRYOUT_FORM_URL,
  TRYOUT_KIT,
  TRYOUT_LOCATION,
} from "@/lib/club";

export const metadata: Metadata = {
  title: "Tryouts",
  description:
    "Fall 2026 tryout dates, times, and what to bring for UC San Diego men's club soccer.",
};

export default function TryoutsPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <h1 className="headline text-xl sm:text-2xl">Fall Tryouts</h1>
        <SectionHeading>Sessions</SectionHeading>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {TRYOUTS.map((session) => (
            <li key={session.day} className="bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted">
                {session.day}
              </p>
              <p className="headline mt-1 text-lg">{session.time}</p>
              <p className="mt-0.5 text-sm">{session.date}</p>
              <p className="mt-0.5 text-sm text-muted">{TRYOUT_LOCATION}</p>
            </li>
          ))}
        </ol>

        <SectionHeading>What to bring</SectionHeading>
        <ul className="mt-3 divide-y divide-border">
          {TRYOUT_KIT.map((item) => (
            <li key={item} className="py-2.5 text-sm font-medium">
              {item}
            </li>
          ))}
        </ul>

        {/* Last on the page by design: the dates and the kit list come first,
            so nobody registers before reading what they're signing up for. */}
        <SectionHeading>Sign up</SectionHeading>
        <p className="mt-3 text-sm text-muted">
          Fill out the registration form before your first session — scan the
          code or follow the link.
        </p>

        {/* The code and the link are the same destination, side by side from
            `sm` up: a phone taps, a laptop screen gets scanned by a phone. */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <a
            href={TRYOUT_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tryout registration form"
            className="shrink-0 self-start bg-surface p-3 transition hover:opacity-90"
          >
            <Image
              src="/tryouts-qr.svg"
              alt=""
              width={160}
              height={160}
              /* A vector has nothing to gain from the optimizer, which refuses
                 SVG anyway. */
              unoptimized
              className="size-36 sm:size-40"
            />
          </a>

          <div className="min-w-0">
            <a
              href={TRYOUT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-navy px-3 py-1.5 text-sm font-semibold text-yellow transition hover:opacity-90"
            >
              Open the tryout form
            </a>
            <p className="mt-3 text-sm text-muted">
              Questions? Email{" "}
              <a
                href={`mailto:${TEAM_EMAIL}`}
                className="font-medium text-blue underline underline-offset-4 transition hover:opacity-70"
              >
                {TEAM_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
