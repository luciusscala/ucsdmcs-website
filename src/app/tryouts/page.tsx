import type { Metadata } from "next";
import { SplitHero } from "@/components/split-hero";
import { SectionHeading } from "@/components/section-heading";
import {
  eligibility,
  faq,
  tryoutSessions,
  tryouts,
  whatToBring,
} from "@/lib/data/tryouts";
import {
  formatDayNumber,
  formatMatchDateLong,
  formatMatchTime,
  formatMonthShort,
} from "@/lib/format";
import { media, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tryouts",
  description: `How to try out for the ${site.season} UC San Diego men's club soccer team — sessions, eligibility and what to bring.`,
};

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed">
          <span aria-hidden className="mt-0.5 shrink-0 font-bold text-gold">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TryoutsPage() {
  return (
    <>
      <SplitHero
        media={media.huddleWide}
        eyebrow={tryouts.status}
        title="Tryouts"
        priority
      >
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
          {tryouts.summary}
        </p>
        <a
          href={`mailto:${site.email}?subject=Tryouts`}
          className="eyebrow mt-8 inline-block self-start rounded-full bg-yellow px-7 py-3.5 text-navy transition-colors hover:bg-white"
        >
          Email the club
        </a>
      </SplitHero>

      {/* Sessions */}
      <section className="container-page py-14">
        <SectionHeading eyebrow={`${site.season} Season`} title="Sessions" />
        <ul className="border-t border-border">
          {tryoutSessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center gap-4 border-b border-border py-5 sm:gap-6"
            >
              <div className="flex w-14 shrink-0 flex-col items-center rounded-md border border-border bg-surface py-2">
                <span className="eyebrow text-[0.6875rem] text-blue">
                  {formatMonthShort(session.date)}
                </span>
                <span className="headline text-2xl text-navy">
                  {formatDayNumber(session.date)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="eyebrow text-[0.6875rem] text-muted">
                  {formatMatchDateLong(session.date)}
                </p>
                <p className="headline mt-1 text-xl text-navy sm:text-2xl">
                  {session.label}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {session.venue}
                  {session.note ? ` · ${session.note}` : ""}
                </p>
              </div>

              <span className="headline shrink-0 text-xl text-navy sm:text-2xl">
                {formatMatchTime(session.date)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted">
          Sessions are at {site.homeVenue}. Dates can move for field
          availability — check Instagram the morning of.
        </p>
      </section>

      {/* Eligibility + kit */}
      <section className="border-t border-border bg-surface py-14">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Before you come" title="Eligibility" />
            <Checklist items={eligibility} />
          </div>
          <div>
            <SectionHeading eyebrow="On the day" title="What to bring" />
            <Checklist items={whatToBring} />
          </div>
        </div>
      </section>

      {/* Dues */}
      <section className="bg-blue text-white">
        <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-[0.6875rem] text-yellow">Season dues</p>
            <p className="headline mt-1 text-2xl sm:text-3xl">{tryouts.fee}</p>
          </div>
          <p className="max-w-md text-sm text-white/75">
            Dues cover league registration, referees, travel and kit. Trying out
            itself is free — nothing is owed until a roster spot is offered.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-page scroll-mt-8 py-14">
        <SectionHeading eyebrow="Questions" title="Before you ask" />
        <dl className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {faq.map((item) => (
            <div key={item.question}>
              <dt className="headline text-xl text-navy">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-12 text-sm text-muted">
          Still stuck?{" "}
          <a
            href={`mailto:${site.email}?subject=Tryouts`}
            className="font-semibold text-blue underline-offset-4 hover:underline"
          >
            {site.email}
          </a>
        </p>
      </section>
    </>
  );
}
