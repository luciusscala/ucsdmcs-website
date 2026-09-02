import type { Metadata } from "next";
import { HeroStats, PageHero } from "@/components/page-hero";
import { ResultBadge } from "@/components/result-badge";
import { SectionHeading } from "@/components/section-heading";
import { StatStrip, StatTile } from "@/components/stat-tile";
import { outcomeOf } from "@/lib/data/schedule";
import {
  type StatLine,
  form,
  keepers,
  leaders,
  statLines,
  teamStats,
} from "@/lib/data/stats";
import { formatMatchDate } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stats",
  description: `Team and player statistics for the ${site.season} UC San Diego men's club soccer season.`,
};

const oneDecimal = (n: number) => n.toFixed(1);
const percent = (n: number) => `${Math.round(n * 100)}%`;

/** Ranked list of players by a single stat. */
function Leaderboard({
  title,
  lines,
  stat,
}: {
  title: string;
  lines: StatLine[];
  stat: "goals" | "assists" | "appearances";
}) {
  return (
    <div>
      <p className="eyebrow border-b-2 border-navy pb-2 text-blue">{title}</p>
      {lines.length === 0 ? (
        <p className="py-6 text-sm text-muted">Nothing recorded yet.</p>
      ) : (
        <ol>
          {lines.map((line, index) => (
            <li
              key={line.number}
              className="flex items-center gap-4 border-b border-border py-3.5 last:border-b-0"
            >
              <span className="eyebrow w-4 shrink-0 text-[0.6875rem] text-muted">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="headline block truncate text-lg text-navy">
                  {line.player.name}
                </span>
                <span className="text-xs text-muted">
                  #{line.number} · {line.player.position}
                </span>
              </span>
              <span className="headline shrink-0 text-2xl text-navy tabular-nums">
                {line[stat]}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function StatsPage() {
  const team = teamStats();
  const recent = form();
  const table = statLines().sort(
    (a, b) =>
      b.goals - a.goals ||
      b.assists - a.assists ||
      a.player.name.localeCompare(b.player.name),
  );
  const gks = keepers();

  return (
    <>
      <PageHero
        eyebrow={`${site.season} Season`}
        title="Stats"
        description="Team totals are derived from played fixtures; player lines are kept by the club and updated after each match."
        aside={
          <HeroStats
            stats={[
              { label: "Played", value: String(team.games) },
              { label: "Record", value: `${team.w}–${team.d}–${team.l}` },
              {
                label: "Goal Diff",
                value: team.goalDiff > 0 ? `+${team.goalDiff}` : String(team.goalDiff),
              },
              { label: "Clean Sheets", value: String(team.cleanSheets) },
            ]}
          />
        }
      />

      {/* Team totals */}
      <section className="container-page py-12">
        <StatStrip>
          <StatTile label="Goals For" value={String(team.gf)} />
          <StatTile label="Goals Against" value={String(team.ga)} />
          <StatTile
            label="Goals / Game"
            value={oneDecimal(team.goalsPerGame)}
          />
          <StatTile label="Win Rate" value={percent(team.winRate)} />
        </StatStrip>
      </section>

      {/* Form guide */}
      {recent.length > 0 && (
        <section className="container-page pb-14">
          <SectionHeading
            eyebrow="Most recent first"
            title="Form"
            href="/schedule#results"
            linkLabel="All results"
          />
          <ul className="flex flex-wrap gap-3">
            {recent.map((match) => {
              const outcome = outcomeOf(match);
              return (
                <li
                  key={match.id}
                  className="flex min-w-[9rem] flex-1 items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  {outcome && <ResultBadge outcome={outcome} />}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-navy">
                      {match.home ? "vs" : "at"} {match.opponent}
                    </span>
                    <span className="text-xs text-muted">
                      {formatMatchDate(match.date)}
                      {match.score
                        ? ` · ${match.score.us}–${match.score.them}`
                        : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Leaderboards */}
      <section className="border-t border-border bg-surface py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Squad" title="Leaders" />
          <div className="grid gap-10 md:grid-cols-3">
            <Leaderboard
              title="Goals"
              lines={leaders("goals")}
              stat="goals"
            />
            <Leaderboard
              title="Assists"
              lines={leaders("assists")}
              stat="assists"
            />
            <Leaderboard
              title="Appearances"
              lines={leaders("appearances")}
              stat="appearances"
            />
          </div>
        </div>
      </section>

      {/* Full table */}
      <section className="container-page py-14">
        <SectionHeading eyebrow="Every player" title="Season totals" />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="eyebrow w-12 px-3 py-3.5 text-left text-[0.6875rem] font-normal">
                  #
                </th>
                <th className="eyebrow px-3 py-3.5 text-left text-[0.6875rem] font-normal">
                  Player
                </th>
                <th className="eyebrow w-16 px-3 py-3.5 text-left text-[0.6875rem] font-normal">
                  Pos
                </th>
                <th
                  title="Appearances"
                  className="eyebrow w-16 px-3 py-3.5 text-right text-[0.6875rem] font-normal"
                >
                  Apps
                </th>
                <th
                  title="Assists"
                  className="eyebrow w-14 px-3 py-3.5 text-right text-[0.6875rem] font-normal"
                >
                  A
                </th>
                <th
                  title="Goals"
                  className="eyebrow w-14 px-3 py-3.5 text-right text-[0.6875rem] text-yellow"
                >
                  G
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((line, index) => (
                <tr
                  key={line.number}
                  className={index % 2 === 1 ? "bg-surface" : "bg-background"}
                >
                  <td className="px-3 py-3.5 text-muted tabular-nums">
                    {line.number}
                  </td>
                  <td className="headline px-3 py-3.5 text-lg text-navy">
                    {line.player.name}
                    {line.player.captain && (
                      <span title="Captain" className="ml-2 text-sm text-gold">
                        (C)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-muted">
                    {line.player.position}
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums">
                    {line.appearances}
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums">
                    {line.assists}
                  </td>
                  <td className="px-3 py-3.5 text-right font-bold text-navy tabular-nums">
                    {line.goals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gks.length > 0 && (
          <div className="mt-12">
            <SectionHeading eyebrow="Between the posts" title="Goalkeeping" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gks.map((line) => (
                <li
                  key={line.number}
                  className="border-l-[3px] border-blue bg-surface px-5 py-4"
                >
                  <p className="headline text-xl text-navy">
                    {line.player.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {line.appearances}{" "}
                    {line.appearances === 1 ? "appearance" : "appearances"} ·{" "}
                    {line.cleanSheets}{" "}
                    {line.cleanSheets === 1 ? "clean sheet" : "clean sheets"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
