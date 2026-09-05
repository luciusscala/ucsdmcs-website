import type { Metadata } from "next";

import { MatchRow } from "@/components/match-row";
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
    <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-4">
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

  return (
    <div className="container-page py-12 sm:py-16">
      <header>
        <p className="text-sm font-medium text-blue">Men&rsquo;s Club Soccer</p>
        <h1 className="headline mt-1 text-4xl sm:text-5xl">
          Schedule &amp; Results
        </h1>
        <RecordStrip games={games} />
      </header>

      {failed ? (
        <p className="py-16 text-muted">
          The schedule is unavailable right now. Please check back shortly.
        </p>
      ) : games.length === 0 ? (
        <p className="py-16 text-muted">No games on the schedule yet.</p>
      ) : (
        <ul className="mt-10 border-t border-border">
          {games.map((game) => (
            <MatchRow key={game.id} game={game} />
          ))}
        </ul>
      )}
    </div>
  );
}
