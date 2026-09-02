import type { Metadata } from "next";
import { MatchRow } from "@/components/match-row";
import { HeroStats, PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import {
  type Match,
  finalMatches,
  seasonRecord,
  upcomingMatches,
} from "@/lib/data/schedule";
import { formatMonth } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schedule & Results",
  description: `Fixtures and results for the ${site.season} UC San Diego men's club soccer season.`,
};

function groupByMonth(matches: Match[]) {
  const groups: { month: string; matches: Match[] }[] = [];
  for (const match of matches) {
    const month = formatMonth(match.date);
    const last = groups.at(-1);
    if (last?.month === month) last.matches.push(match);
    else groups.push({ month, matches: [match] });
  }
  return groups;
}

export default function SchedulePage() {
  const upcoming = upcomingMatches();
  const results = finalMatches();
  const record = seasonRecord();

  return (
    <>
      <PageHero
        eyebrow={`${site.season} Season`}
        title="Schedule & Results"
        description={`Every fixture in the ${site.league}, plus postseason play. Home matches at ${site.homeVenue}.`}
        aside={
          <HeroStats
            stats={[
              { label: "Record", value: `${record.w}–${record.d}–${record.l}` },
              { label: "Played", value: String(results.length) },
              { label: "Goals For", value: String(record.gf) },
              { label: "Goals Against", value: String(record.ga) },
            ]}
          />
        }
      />

      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page flex gap-8">
          <a href="#upcoming" className="eyebrow py-4 text-navy hover:text-blue">
            Upcoming ({upcoming.length})
          </a>
          <a href="#results" className="eyebrow py-4 text-navy hover:text-blue">
            Results ({results.length})
          </a>
        </div>
      </nav>

      <section id="upcoming" className="container-page scroll-mt-24 py-14">
        <SectionHeading eyebrow="Fixtures" title="Upcoming" />
        {upcoming.length === 0 ? (
          <p className="py-10 text-muted">No matches scheduled right now.</p>
        ) : (
          groupByMonth(upcoming).map((group) => (
            <div key={group.month} className="mb-10 last:mb-0">
              <p className="eyebrow mb-2 text-blue">{group.month}</p>
              <ul className="border-t border-border">
                {group.matches.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section
        id="results"
        className="scroll-mt-24 border-t border-border bg-surface py-16"
      >
        <div className="container-page">
          <SectionHeading eyebrow="Final scores" title="Results" />
          {results.length === 0 ? (
            <p className="py-10 text-muted">No results yet this season.</p>
          ) : (
            groupByMonth(results).map((group) => (
              <div key={group.month} className="mb-10 last:mb-0">
                <p className="eyebrow mb-2 text-blue">{group.month}</p>
                <ul className="border-t border-border">
                  {group.matches.map((match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
