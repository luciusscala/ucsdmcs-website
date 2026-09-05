import type { Metadata } from "next";

import { MatchRow } from "@/components/match-row";
import { getSeasonFor } from "@/lib/data/season";
import { type Game, getGames, seasonRecord } from "@/lib/data/schedule";

export const metadata: Metadata = {
  title: "Schedule & Results",
  description:
    "Every fixture and result for UC San Diego men's club soccer, in chronological order.",
};

/** Serve a static page, refreshed at most every five minutes. */
export const revalidate = 300;

function RecordStrip({ games }: { games: Game[] }) {
  const record = seasonRecord(games);
  if (record.played === 0) return null;

  const stats = [
    { label: "Record", value: `${record.w}–${record.d}–${record.l}` },
    { label: "Played", value: String(record.played) },
    { label: "Goals For", value: String(record.gf) },
    { label: "Goals Against", value: String(record.ga) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface px-4 py-3">
          <dt className="text-sm text-muted">{stat.label}</dt>
          <dd className="headline mt-0.5 text-2xl tabular-nums">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function SchedulePage() {
  // A Supabase outage or a missing RLS policy shouldn't fail the whole build,
  // so failure degrades to an error state on this page. It stays distinct from
  // the empty state below — "unavailable" must never read as "no games yet".
  let games: Game[] = [];
  let failed = false;

  try {
    games = await getGames();
  } catch (error) {
    console.error(error);
    failed = true;
  }

  // Cached per render, so this reuses the lookup getGames already made.
  const season = await getSeasonFor("games").catch(() => null);

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="mb-6">
        <p className="text-sm font-medium text-yellow">
          {season ? `${season.year} Season` : "Men\u2019s Club Soccer"}
        </p>
        <h1 className="headline mt-1 text-4xl sm:text-5xl">
          Schedule &amp; Results
        </h1>
      </header>

      <div className="rounded-lg bg-background p-4 text-foreground sm:p-6">
        <RecordStrip games={games} />

        {failed ? (
          <p className="py-10 text-muted">
            The schedule is unavailable right now. Please check back shortly.
          </p>
        ) : games.length === 0 ? (
          <p className="py-10 text-muted">No games on the schedule yet.</p>
        ) : (
          <ul className="mt-6 border-t border-border first:mt-0">
            {games.map((game) => (
              <MatchRow key={game.id} game={game} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
