import type { Metadata } from "next";

import { RosterTable } from "@/components/roster-table";
import { SeasonPicker } from "@/components/season-picker";
import { type Player, getPlayers } from "@/lib/data/roster";
import { getSeasonByYear, getSeasonFor, listSeasons } from "@/lib/data/season";

export const metadata: Metadata = {
  title: "Roster",
  description: "The full UC San Diego men's club soccer squad, by position.",
};

export default async function RosterPage(props: PageProps<"/roster">) {
  const params = await props.searchParams;
  const requested = Number(
    Array.isArray(params.season) ? params.season[0] : params.season,
  );

  const seasons = await listSeasons();
  const season =
    (Number.isInteger(requested) ? await getSeasonByYear(requested) : null) ??
    (await getSeasonFor("player_seasons"));

  // As on the schedule, a Supabase outage degrades to an error state rather
  // than failing the build. "Unavailable" stays distinct from "no players".
  let players: Player[] = [];
  let failed = false;

  try {
    players = season ? await getPlayers(season.id) : [];
  } catch (error) {
    console.error(error);
    failed = true;
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <h1 className="headline text-xl sm:text-2xl">
          {season ? `${season.year} ` : ""}Men&rsquo;s Club Soccer Roster
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 bg-surface px-4 py-3">
          <span className="text-sm text-muted">
            {players.length} {players.length === 1 ? "player" : "players"}
          </span>
          <SeasonPicker seasons={seasons} selected={season} />
        </div>

        {failed ? (
          <p className="py-10 text-muted">
            The roster is unavailable right now. Please check back shortly.
          </p>
        ) : players.length === 0 ? (
          <p className="py-10 text-muted">No players listed yet.</p>
        ) : (
          <RosterTable players={players} />
        )}
      </div>
    </div>
  );
}
