import { getSeasonFor } from "@/lib/data/season";
import { headshotUrl, supabase } from "@/lib/supabase";

/**
 * One `player_seasons` row with its `players` row embedded. Class, position
 * and number live on the join because they change season to season; name,
 * hometown and picture belong to the person.
 */
type PlayerSeasonRow = {
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

export type Player = {
  id: string;
  name: string;
  /** Freshman | Sophomore | Junior | Senior, per the valid_class constraint. */
  year: string;
  position: string;
  number: number | null;
  hometown: string | null;
  /** Already resolved to a public URL; null when the player has no headshot. */
  headshot: string | null;
};

function toPlayer(row: PlayerSeasonRow): Player | null {
  // A to-one embed comes back as an object, but supabase-js widens the type to
  // an array in some inference paths.
  const person = Array.isArray(row.player) ? row.player[0] : row.player;
  if (!person) return null;

  return {
    id: person.id,
    name: person.name,
    year: row.class,
    position: row.position,
    number: row.number,
    hometown: person.hometown,
    headshot: headshotUrl(person.picture_path),
  };
}

/** The current season's squad, by number with unnumbered players last. */
export async function getPlayers(): Promise<Player[]> {
  if (!supabase) return [];

  const season = await getSeasonFor("player_seasons");
  if (!season) return [];

  const { data, error } = await supabase
    .from("player_seasons")
    .select("class, position, number, player:players(id, name, hometown, picture_path)")
    .eq("season_id", season.id);

  if (error) throw new Error(`Failed to load players: ${error.message}`);

  // Sorted here rather than in SQL: the tiebreaker is the player's name, which
  // lives on the embedded table and can't order the parent rows in PostgREST.
  return (data as unknown as PlayerSeasonRow[])
    .map(toPlayer)
    .filter((player): player is Player => player !== null)
    .sort(
      (a, b) =>
        (a.number ?? Infinity) - (b.number ?? Infinity) ||
        a.name.localeCompare(b.name),
    );
}

/**
 * Filter-tab order, back-to-front the way a lineup is read. Goalkeeper is
 * listed ahead of the current valid_position constraint, which omits it.
 */
const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

/**
 * Positions actually present, in lineup order, with anything unrecognised
 * appended. Deriving from the data means no dead tab with a count of zero.
 */
export function positionsIn(players: Player[]) {
  const present = [...new Set(players.map((player) => player.position))];
  const rank = (position: string) => {
    const index = POSITION_ORDER.indexOf(position);
    return index === -1 ? POSITION_ORDER.length : index;
  };
  return present.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

