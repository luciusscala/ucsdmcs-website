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
  ourScore: number | null;
  theirScore: number | null;
  opponent: string;
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
        (a.number ?? Infinity) - (b.number ?? Infinity) ||
        a.name.localeCompare(b.name),
    );
}

type GameRow = {
  id: string;
  game_date: string;
  is_home: boolean;
  location: string | null;
  our_score: number | null;
  their_score: number | null;
  opponent: { name: string } | null;
};

export async function listGames(seasonId: string): Promise<AdminGame[]> {
  const { data, error } = await requireAdminClient()
    .from("games")
    .select("id, game_date, is_home, location, our_score, their_score, opponent:schools(name)")
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
      ourScore: row.our_score,
      theirScore: row.their_score,
      opponent: school?.name ?? "TBD",
    };
  });
}
