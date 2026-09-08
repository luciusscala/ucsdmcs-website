import { getSeasonFor } from "@/lib/data/season";
import { logoUrl, supabase } from "@/lib/supabase";

/** Shape returned by the query below. Mirrors the `games` table plus the
 *  embedded `schools` row reached through `opponent_id`. */
type GameRow = {
  id: string;
  game_date: string;
  is_home: boolean;
  location: string | null;
  address: string | null;
  our_score: number | null;
  their_score: number | null;
  opponent: { name: string; logo_path: string | null } | null;
};

/** The domain shape the UI works with. Nothing outside this file sees a raw row. */
export type Game = {
  id: string;
  /** ISO 8601, straight from `game_date`. */
  kickoff: string;
  opponent: string;
  /** Already resolved to a public URL; null when the school has no crest. */
  opponentLogo: string | null;
  isHome: boolean;
  /** The venue as it should read on the page: "John Muir Field, La Jolla". */
  location: string | null;
  /** Street address, only for building a map link. Null on most rows. */
  address: string | null;
  ourScore: number | null;
  theirScore: number | null;
};

export type Outcome = "W" | "L" | "D";

/**
 * Turn-by-turn directions to a game's address. Google's universal URL form
 * needs no API key and is handled by the Google Maps app on both iOS and
 * Android, falling back to the web map anywhere else.
 *
 * Keyed off `address`, not `location`: a label like "Los Angeles, CA" is
 * worth printing but not worth routing someone to.
 */
export const directionsUrl = (game: Game) =>
  game.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        game.address,
      )}`
    : null;

const SELECT =
  "id, game_date, is_home, location, address, our_score, their_score, opponent:schools(name, logo_path)";

function toGame(row: GameRow): Game {
  // A to-one embed comes back as an object, but supabase-js widens the type to
  // an array in some inference paths. Normalise so a shape change can't blank
  // out every opponent name silently.
  const school = Array.isArray(row.opponent) ? row.opponent[0] : row.opponent;

  return {
    id: row.id,
    kickoff: row.game_date,
    opponent: school?.name ?? "TBD",
    opponentLogo: logoUrl(school?.logo_path ?? null),
    isHome: row.is_home,
    location: row.location,
    address: row.address,
    ourScore: row.our_score,
    theirScore: row.their_score,
  };
}

/**
 * A season's games, oldest first. Postgres does the ordering. Without an
 * explicit id this falls back to whichever season the schedule defaults to.
 */
export async function getGames(seasonId?: string): Promise<Game[]> {
  if (!supabase) return [];

  const season = seasonId
    ? { id: seasonId }
    : await getSeasonFor("games");
  if (!season) return [];

  const { data, error } = await supabase
    .from("games")
    .select(SELECT)
    .eq("season_id", season.id)
    .order("game_date", { ascending: true });

  if (error) throw new Error(`Failed to load games: ${error.message}`);

  return (data as unknown as GameRow[]).map(toGame);
}

/** There is no status column, so a game counts as played once both scores land. */
export const hasResult = (
  game: Game,
): game is Game & { ourScore: number; theirScore: number } =>
  game.ourScore !== null && game.theirScore !== null;

export function outcome(game: Game): Outcome | null {
  if (!hasResult(game)) return null;
  if (game.ourScore > game.theirScore) return "W";
  if (game.ourScore < game.theirScore) return "L";
  return "D";
}

/** The soonest game without a result. Games arrive sorted, so this is a find. */
export const nextGame = (games: Game[]) =>
  games.find((game) => !hasResult(game)) ?? null;

type Tally = { w: number; d: number; l: number };

const tally = (): Tally => ({ w: 0, d: 0, l: 0 });

const add = (into: Tally, result: Outcome) => {
  if (result === "W") into.w += 1;
  else if (result === "D") into.d += 1;
  else into.l += 1;
};

/** "2-1-0", the order college athletics writes it: wins, losses, draws. */
export const formatTally = (t: Tally) => `${t.w}-${t.l}-${t.d}`;

/**
 * Win percentage the way college athletics computes it: a draw counts as half
 * a win. Returns null before a game is played, so the panel shows "—" rather
 * than a misleading .000.
 */
export function winPct(t: Tally) {
  const played = t.w + t.d + t.l;
  if (played === 0) return null;
  return (t.w + t.d / 2) / played;
}

/** ".667" — leading zero dropped, as scoreboards write it. */
export const formatPct = (pct: number | null) =>
  pct === null ? "—" : pct.toFixed(3).replace(/^0/, "");

/**
 * Current run of the same result, most recent game first: "W3", "L1", "—".
 * Games arrive oldest-first, so this walks backwards.
 */
export function currentStreak(games: Game[]) {
  let streak: Outcome | null = null;
  let count = 0;

  for (let i = games.length - 1; i >= 0; i -= 1) {
    const result = outcome(games[i]);
    if (!result) continue;
    if (streak === null) {
      streak = result;
      count = 1;
    } else if (result === streak) {
      count += 1;
    } else {
      break;
    }
  }

  return streak ? `${streak}${count}` : "—";
}

export function seasonRecord(games: Game[]) {
  const overall = tally();
  const home = tally();
  const away = tally();
  let gf = 0;
  let ga = 0;

  for (const game of games) {
    if (!hasResult(game)) continue;
    gf += game.ourScore;
    ga += game.theirScore;

    const result = outcome(game);
    if (!result) continue;
    add(overall, result);
    add(game.isHome ? home : away, result);
  }

  return {
    overall,
    home,
    away,
    gf,
    ga,
    gd: gf - ga,
    played: overall.w + overall.d + overall.l,
    pct: winPct(overall),
  };
}
