import { getSeasonFor } from "@/lib/data/season";
import { supabase } from "@/lib/supabase";

/**
 * One `player_seasons` row with its `players` row embedded. Class, position
 * and number live on the join because they change season to season; name
 * and hometown belong to the person.
 */
type PlayerSeasonRow = {
  class: string;
  position: string;
  number: number | null;
  player: {
    id: string;
    name: string;
    hometown: string | null;
  } | null;
};

export type Player = {
  id: string;
  name: string;
  /** Freshman | Sophomore | Junior | Senior | Graduate, per the valid_class
   *  constraint. */
  year: string;
  position: string;
  number: number | null;
  hometown: string | null;
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
  };
}

/**
 * A season's squad, by number with unnumbered players last. Without an
 * explicit id this falls back to whichever season the roster defaults to.
 */
export async function getPlayers(seasonId?: string): Promise<Player[]> {
  if (!supabase) return [];

  const season = seasonId
    ? { id: seasonId }
    : await getSeasonFor("player_seasons");
  if (!season) return [];

  const { data, error } = await supabase
    .from("player_seasons")
    .select("class, position, number, player:players(id, name, hometown)")
    .eq("season_id", season.id);

  if (error) throw new Error(`Failed to load players: ${error.message}`);

  // Sorted here rather than in SQL: the tiebreaker is the player's name, which
  // lives on the embedded table and can't order the parent rows in PostgREST.
  return (data as unknown as PlayerSeasonRow[])
    .map(toPlayer)
    .filter((player): player is Player => player !== null)
    .sort(
      (a, b) =>
        compareNumbers(a.number, b.number) || a.name.localeCompare(b.name),
    );
}

/** Table abbreviations, as athletics rosters write them. */
const POSITION_ABBREVIATION: Record<string, string> = {
  Goalkeeper: "GK",
  Defender: "D",
  Midfielder: "MF",
  Forward: "F",
};

const CLASS_ABBREVIATION: Record<string, string> = {
  Freshman: "Fr.",
  Sophomore: "So.",
  Junior: "Jr.",
  Senior: "Sr.",
  Graduate: "Gr."
};

/** Falls through unchanged for any value not in the map, so a new
 *  constraint value shows as itself rather than disappearing. */
export const abbreviatePosition = (position: string) =>
  POSITION_ABBREVIATION[position] ?? position;

export const abbreviateClass = (year: string) =>
  CLASS_ABBREVIATION[year] ?? year;

/**
 * Sort orders. Positions run back-to-front the way a lineup is read, classes
 * by seniority — sorting either alphabetically would produce a meaningless
 * order ("D, F, GK, MF"). Unknown values rank last rather than disappearing.
 */
const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
const CLASS_ORDER = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const rankIn = (order: string[], value: string) => {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
};

export const positionRank = (position: string) =>
  rankIn(POSITION_ORDER, position);

export const classRank = (year: string) => rankIn(CLASS_ORDER, year);

/**
 * Squad numbers ascending with unnumbered players always last, in either
 * direction. Subtracting two Infinity placeholders would yield NaN, which
 * makes the comparator undefined, so nulls are handled before the subtraction.
 */
export function compareNumbers(
  a: number | null,
  b: number | null,
  factor = 1,
) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * factor;
}

