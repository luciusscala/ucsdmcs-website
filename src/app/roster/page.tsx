import type { Metadata } from "next";

import { RosterGrid } from "@/components/roster-grid";
import { type Player, getPlayers } from "@/lib/data/roster";
import { getSeasonFor } from "@/lib/data/season";

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

  // Cached per render, so this reuses the lookup getPlayers already made.
  const season = await getSeasonFor("player_seasons").catch(() => null);

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="mb-6">
        <p className="text-sm font-medium text-yellow">
          {season ? `${season.year} Season` : "Men\u2019s Club Soccer"}
        </p>
        <h1 className="headline mt-1 text-4xl sm:text-5xl">Roster</h1>
        {players.length > 0 && (
          <p className="mt-2 text-sm text-white/70">{players.length} players</p>
        )}
      </header>

      {failed ? (
        <p className="py-10 text-white/70">
          The roster is unavailable right now. Please check back shortly.
        </p>
      ) : players.length === 0 ? (
        <p className="py-10 text-white/70">No players listed yet.</p>
      ) : (
        <RosterGrid players={players} />
      )}
    </div>
  );
}
