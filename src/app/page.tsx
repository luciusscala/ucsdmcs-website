import Image from "next/image";
import Link from "next/link";
import { MatchRow } from "@/components/match-row";
import { SplitHero } from "@/components/split-hero";
import { SectionHeading } from "@/components/section-heading";
import { StatStrip, StatTile } from "@/components/stat-tile";
import {
  finalMatches,
  nextMatch,
  seasonRecord,
  upcomingMatches,
} from "@/lib/data/schedule";
import {
  OUR_TEAM,
  goalDiff,
  points,
  sortedStandings,
} from "@/lib/data/standings";
import { formatMatchDateLong, formatMatchTime } from "@/lib/format";
import { media, site } from "@/lib/site";

function StandingsSnapshot() {
  const table = sortedStandings();
  const top = table.slice(0, 5);
  const ourIndex = table.findIndex((r) => r.team === OUR_TEAM);
  const rows = ourIndex > 4 ? [...top, table[ourIndex]] : top;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="eyebrow border-b border-border text-[0.6875rem] text-muted">
          <th className="w-8 py-2 text-left font-normal">#</th>
          <th className="py-2 text-left font-normal">Club</th>
          <th className="w-10 py-2 text-right font-normal">GP</th>
          <th className="w-10 py-2 text-right font-normal">GD</th>
          <th className="w-10 py-2 text-right font-normal">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const position = table.indexOf(row) + 1;
          const ours = row.team === OUR_TEAM;
          return (
            <tr
              key={row.team}
              className={`border-b border-border last:border-b-0 ${
                ours ? "bg-navy text-white" : ""
              }`}
            >
              <td className="py-3 pl-2 font-semibold">{position}</td>
              <td className={`py-3 ${ours ? "font-semibold" : ""}`}>
                {row.team}
              </td>
              <td className="py-3 text-right tabular-nums">{row.played}</td>
              <td className="py-3 text-right tabular-nums">
                {goalDiff(row) > 0 ? `+${goalDiff(row)}` : goalDiff(row)}
              </td>
              <td className="py-3 pr-2 text-right font-bold tabular-nums">
                {points(row)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function Home() {
  const next = nextMatch();
  const record = seasonRecord();
  const table = sortedStandings();
  const position = table.findIndex((r) => r.team === OUR_TEAM) + 1;
  const ordinal =
    position === 1
      ? "1st"
      : position === 2
        ? "2nd"
        : position === 3
          ? "3rd"
          : `${position}th`;

  return (
    <>
      <SplitHero
        media={media.lineups}
        eyebrow={`${site.season} · ${site.league}`}
        title="UC San Diego"
        titleAccent="Men's Club Soccer"
        size="hero"
        priority
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/schedule"
            className="eyebrow rounded-full bg-yellow px-7 py-3.5 text-navy transition-colors hover:bg-white"
          >
            Schedule &amp; Results
          </Link>
          <Link
            href="/roster"
            className="eyebrow rounded-full border border-white/40 px-7 py-3.5 text-white transition-colors hover:border-yellow hover:text-yellow"
          >
            Roster
          </Link>
        </div>
      </SplitHero>

      {/* Next match */}
      {next && (
        <section className="bg-blue text-white">
          <div className="container-page flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex flex-col gap-1">
              <p className="eyebrow text-[0.6875rem] text-yellow">
                Next Match · {next.home ? "Home" : "Away"}
              </p>
              <p className="headline text-3xl sm:text-4xl">
                {next.home ? "vs" : "at"} {next.opponent}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm sm:grid-cols-3 lg:gap-x-14">
              <div>
                <dt className="eyebrow text-[0.625rem] text-white/60">Date</dt>
                <dd className="mt-1">{formatMatchDateLong(next.date)}</dd>
              </div>
              <div>
                <dt className="eyebrow text-[0.625rem] text-white/60">
                  Kickoff
                </dt>
                <dd className="mt-1">{formatMatchTime(next.date)}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="eyebrow text-[0.625rem] text-white/60">Venue</dt>
                <dd className="mt-1">{next.venue}</dd>
              </div>
            </dl>

            <Link
              href="/schedule"
              className="eyebrow shrink-0 text-yellow transition-colors hover:text-white"
            >
              Full schedule →
            </Link>
          </div>
          </section>
      )}

      {/* Season snapshot */}
      <section className="container-page py-12">
        <StatStrip>
          <StatTile
            label="Record (W–D–L)"
            value={`${record.w}–${record.d}–${record.l}`}
          />
          <StatTile label="Conference" value={position > 0 ? ordinal : "—"} />
          <StatTile label="Goals For" value={String(record.gf)} />
          <StatTile label="Goals Against" value={String(record.ga)} />
        </StatStrip>
      </section>

      {/* Fixtures + results */}
      <section className="container-page grid gap-14 pb-16 lg:grid-cols-2">
        <div>
          <SectionHeading title="Upcoming" href="/schedule" />
          <ul>
            {upcomingMatches()
              .slice(0, 3)
              .map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
          </ul>
        </div>
        <div>
          <SectionHeading title="Results" href="/schedule#results" />
          <ul>
            {finalMatches()
              .slice(0, 3)
              .map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
          </ul>
        </div>
      </section>

      {/* Standings */}
      <section className="border-t border-border bg-surface py-16">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
            <Image
              src={media.huddleWide.src}
              alt={media.huddleWide.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              style={{ objectPosition: media.huddleWide.focus }}
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow={site.league}
              title="Standings"
              href="/standings"
              linkLabel="Full table"
            />
            <div className="rounded-lg border border-border bg-background p-6">
              <StandingsSnapshot />
            </div>
          </div>
        </div>
      </section>

      {/* Tryouts */}
      <section id="tryouts" className="scroll-mt-8 bg-navy text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-56 sm:h-72 lg:h-auto lg:min-h-[22rem]">
            <Image
              src={media.huddle.src}
              alt={media.huddle.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              style={{ objectPosition: media.huddle.focus }}
              className="object-cover"
            />
            <div className="absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-navy to-transparent lg:block" />
          </div>
          <div className="pad-gutter-r flex flex-col justify-center py-14 pl-5 lg:pl-14">
            <p className="eyebrow text-yellow">Tryouts</p>
            <h2 className="headline mt-3 text-4xl sm:text-5xl">
              Open every fall quarter
            </h2>
            <p className="mt-4 max-w-md text-white/75">
              Open to all currently enrolled UC San Diego students.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="eyebrow mt-8 inline-block self-start rounded-full bg-yellow px-7 py-3.5 text-navy transition-colors hover:bg-white"
            >
              {site.email}
            </a>
          </div>
        </div>
      </section>

    </>
  );
}
