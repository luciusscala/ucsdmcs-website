import { compareNumbers } from "@/lib/data/roster";
import type { SeasonScopedTable } from "@/lib/data/season";
import { requireAdminClient } from "@/lib/supabase-admin";
import "server-only";

export type AdminSeason = { id: string; year: number; is_current: boolean };
export type AdminSchool = { id: string; name: string; logo_path: string | null };

export type AdminRosterEntry = {
  /** `player_seasons.id` — the row an edit updates. */
  entryId: string;
  playerId: string;
  name: string;
  hometown: string | null;
  picturePath: string | null;
  year: string;
  position: string;
  number: number | null;
};

export type AdminGame = {
  id: string;
  gameDate: string;
  isHome: boolean;
  location: string | null;
  address: string | null;
  ourScore: number | null;
  theirScore: number | null;
  opponent: string;
  /** Selects the current school in the edit form's dropdown. */
  opponentId: string | null;
};

export async function listSeasons(): Promise<AdminSeason[]> {
  const { data, error } = await requireAdminClient()
    .from("seasons")
    .select("id, year, is_current")
    .order("year", { ascending: false });

  if (error) throw new Error(`Failed to load seasons: ${error.message}`);
  return (data ?? []) as AdminSeason[];
}

export async function listSchools(): Promise<AdminSchool[]> {
  const { data, error } = await requireAdminClient()
    .from("schools")
    .select("id, name, logo_path")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load schools: ${error.message}`);
  return (data ?? []) as AdminSchool[];
}

type RosterRow = {
  id: string;
  class: string;
  position: string;
  number: number | null;
  player: {
    id: string;
    name: string;
    hometown: string | null;
    picture_path: string | null;
  } | null;
};

export async function listRoster(seasonId: string): Promise<AdminRosterEntry[]> {
  const { data, error } = await requireAdminClient()
    .from("player_seasons")
    .select("id, class, position, number, player:players(id, name, hometown, picture_path)")
    .eq("season_id", seasonId);

  if (error) throw new Error(`Failed to load roster: ${error.message}`);

  return ((data ?? []) as unknown as RosterRow[])
    .flatMap((row) => {
      const person = Array.isArray(row.player) ? row.player[0] : row.player;
      if (!person) return [];
      return [
        {
          entryId: row.id,
          playerId: person.id,
          name: person.name,
          hometown: person.hometown,
          picturePath: person.picture_path,
          year: row.class,
          position: row.position,
          number: row.number,
        },
      ];
    })
    .sort(
      (a, b) =>
        compareNumbers(a.number, b.number) || a.name.localeCompare(b.name),
    );
}

type GameRow = {
  id: string;
  game_date: string;
  is_home: boolean;
  location: string | null;
  address: string | null;
  our_score: number | null;
  their_score: number | null;
  opponent_id: string | null;
  opponent: { name: string } | null;
};

export async function listGames(seasonId: string): Promise<AdminGame[]> {
  const { data, error } = await requireAdminClient()
    .from("games")
    .select("id, game_date, is_home, location, address, our_score, their_score, opponent_id, opponent:schools(name)")
    .eq("season_id", seasonId)
    .order("game_date", { ascending: true });

  if (error) throw new Error(`Failed to load games: ${error.message}`);

  return ((data ?? []) as unknown as GameRow[]).map((row) => {
    const school = Array.isArray(row.opponent) ? row.opponent[0] : row.opponent;
    return {
      id: row.id,
      gameDate: row.game_date,
      isHome: row.is_home,
      location: row.location,
      address: row.address,
      ourScore: row.our_score,
      theirScore: row.their_score,
      opponent: school?.name ?? "TBD",
      opponentId: row.opponent_id,
    };
  });
}

/**
 * The season an admin page should edit.
 *
 * `?season=2025` wins when it names a real season. Otherwise this mirrors the
 * public `getSeasonFor()`: the current season when it actually has rows, then
 * the most recent season that does. Without that fallback an admin landing on
 * a newly flagged season sees an empty list and no sign that last year's rows
 * exist — which is exactly how 26 players became unreachable.
 */
export async function adminSeason(
  table: SeasonScopedTable,
  requestedYear: string | string[] | undefined,
): Promise<{ seasons: AdminSeason[]; season: AdminSeason | undefined }> {
  const client = requireAdminClient();

  const [seasons, rows] = await Promise.all([
    listSeasons(),
    client.from(table).select("season_id"),
  ]);

  if (rows.error) {
    throw new Error(`Failed to load ${table} seasons: ${rows.error.message}`);
  }

  const year = Number(
    Array.isArray(requestedYear) ? requestedYear[0] : requestedYear,
  );
  const asked = Number.isInteger(year)
    ? seasons.find((season) => season.year === year)
    : undefined;
  if (asked) return { seasons, season: asked };

  const populated = new Set(
    ((rows.data ?? []) as { season_id: string }[]).map((row) => row.season_id),
  );
  const current = seasons.find((season) => season.is_current);
  if (current && populated.has(current.id)) return { seasons, season: current };

  // `listSeasons` is newest-first, so this is the latest season with rows.
  const fallback = seasons.find((season) => populated.has(season.id));
  return { seasons, season: fallback ?? current ?? seasons[0] };
}
