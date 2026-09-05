import type { Metadata } from "next";

import { PlayerCard } from "@/components/player-card";
import {
  type Player,
  getPlayers,
  groupByPosition,
  positionLabel,
} from "@/lib/data/roster";

export const metadata: Metadata = {
  title: "Roster",
  description: "The full UC San Diego men's club soccer squad, by position.",
};

/** Serve a static page, refreshed at most every five minutes. */
export const revalidate = 300;

export default async function RosterPage() {
  // As on the schedule, a Supabase outage degrades to an error state rather
  // than failing the build. "Unavailable" stays distinct from "no players".
  let players: Player[] = [];
  let failed = false;

  try {
    players = await getPlayers();
  } catch (error) {
    console.error(error);
    failed = true;
  }

  const groups = groupByPosition(players);

  return (
    <div className="container-page py-12 sm:py-16">
      <header>
        <p className="text-sm font-medium text-blue">Men&rsquo;s Club Soccer</p>
        <h1 className="headline mt-1 text-4xl sm:text-5xl">Roster</h1>
        {players.length > 0 && (
          <p className="mt-3 text-sm text-muted">{players.length} players</p>
        )}
      </header>

      {failed ? (
        <p className="py-16 text-muted">
          The roster is unavailable right now. Please check back shortly.
        </p>
      ) : players.length === 0 ? (
        <p className="py-16 text-muted">No players listed yet.</p>
      ) : (
        groups.map((group) => (
          <section key={group.position} className="mt-12">
            <h2 className="border-b border-border pb-2 text-sm font-semibold text-blue">
              {positionLabel(group.position)}
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {group.players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
