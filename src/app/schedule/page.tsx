import type { Metadata } from "next";

import { MatchRow } from "@/components/match-row";
import { SeasonPicker } from "@/components/season-picker";
import {
  type Game,
  currentStreak,
  formatPct,
  formatTally,
  getGames,
  seasonRecord,
} from "@/lib/data/schedule";
import {
  getSeasonByYear,
  getSeasonFor,
  listSeasons,
} from "@/lib/data/season";

export const metadata: Metadata = {
  title: "Schedule & Scores",
  description:
    "Every fixture and result for UC San Diego men's club soccer, in chronological order.",
};

function RecordPanel({ games }: { games: Game[] }) {
  const record = seasonRecord(games);

  const stats = [
    { label: "Overall", value: formatTally(record.overall) },
    { label: "Pct", value: formatPct(record.pct) },
    { label: "Streak", value: currentStreak(games) },
    { label: "Home", value: formatTally(record.home) },
    { label: "Away", value: formatTally(record.away) },
    { label: "Goals For", value: String(record.gf) },
    { label: "Goals Against", value: String(record.ga) },
  ];

  return (
    // gap-px over a tinted ground draws the hairlines, which survives the grid
    // wrapping at every breakpoint where real borders would double up.
    <dl className="mt-4 grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-7">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-background px-3 py-3 text-center">
          <dt className="text-xs text-muted">{stat.label}</dt>
          <dd className="headline mt-1 text-2xl tabular-nums">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function SchedulePage(props: PageProps<"/schedule">) {
  const params = await props.searchParams;
  const requested = Number(
    Array.isArray(params.season) ? params.season[0] : params.season,
  );

  const seasons = await listSeasons();
  const season =
    (Number.isInteger(requested) ? await getSeasonByYear(requested) : null) ??
    (await getSeasonFor("games"));

  // A Supabase outage degrades to an error state rather than failing the
  // build. "Unavailable" stays distinct from "no games scheduled".
  let games: Game[] = [];
  let failed = false;

  try {
    games = season ? await getGames(season.id) : [];
  } catch (error) {
    console.error(error);
    failed = true;
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <h1 className="headline text-xl sm:text-2xl">
          {season ? `${season.year} ` : ""}Men&rsquo;s Club Soccer Schedule
          &amp; Scores
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 bg-surface px-4 py-3">
          <a
            href="/schedule/calendar"
            className="bg-navy px-3 py-1.5 text-sm font-semibold text-yellow transition hover:opacity-90"
          >
            Add to calendar
          </a>

          <SeasonPicker seasons={seasons} selected={season} />
        </div>

        <RecordPanel games={games} />

        {failed ? (
          <p className="py-10 text-muted">
            The schedule is unavailable right now. Please check back shortly.
          </p>
        ) : games.length === 0 ? (
          <p className="py-10 text-muted">No games on the schedule yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {games.map((game) => (
              <MatchRow key={game.id} game={game} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
