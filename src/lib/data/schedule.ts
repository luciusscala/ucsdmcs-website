import { logoUrl, supabase } from "@/lib/supabase";

/** Shape returned by the query below. Mirrors the `games` table plus the
 *  embedded `schools` row reached through `opponent_id`. */
type GameRow = {
  id: string;
  game_date: string;
  is_home: boolean;
  location: string | null;
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
  location: string | null;
  ourScore: number | null;
  theirScore: number | null;
};

export type Outcome = "W" | "L" | "D";

const SELECT =
  "id, game_date, is_home, location, our_score, their_score, opponent:schools(name, logo_path)";

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
    ourScore: row.our_score,
    theirScore: row.their_score,
  };
}

/** Every game, oldest first. Ordering is done by Postgres, not in JS. */
export async function getGames(): Promise<Game[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("games")
    .select(SELECT)
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

export function seasonRecord(games: Game[]) {
  const record = { w: 0, d: 0, l: 0, gf: 0, ga: 0, played: 0 };

  for (const game of games) {
    if (!hasResult(game)) continue;
    record.played += 1;
    record.gf += game.ourScore;
    record.ga += game.theirScore;
    const result = outcome(game);
    if (result === "W") record.w += 1;
    else if (result === "D") record.d += 1;
    else if (result === "L") record.l += 1;
  }

  return record;
}
