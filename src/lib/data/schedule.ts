import { cached } from "@/lib/data/cache";
import { getSeasonFor } from "@/lib/data/season";
import { logoUrl, one, supabase } from "@/lib/supabase";

/**
 * Shape returned by the query below. A game is spread across four tables: the
 * `games` row holds the result, its `events` row the kickoff and season, and
 * `teams` and `fields` name the opponent and the venue.
 */
type GameRow = {
  id: string;
  is_home: boolean;
  our_score: number | null;
  their_score: number | null;
  film_link: string | null;
  event: { event_date: string } | null;
  opponent: { name: string; logo_path: string | null } | null;
  field: { name: string; area: string | null; maps_address: string | null } | null;
};

/** The domain shape the UI works with. Nothing outside this file sees a raw row. */
export type Game = {
  id: string;
  /** ISO 8601, straight from the event's `event_date`. */
  kickoff: string;
  opponent: string;
  /** Already resolved to a public URL; null when the team has no crest. */
  opponentLogo: string | null;
  isHome: boolean;
  /** The venue as it should read on the page: "John Muir Field, La Jolla". */
  location: string | null;
  /** The field's map address, only for building a directions link. */
  address: string | null;
  ourScore: number | null;
  theirScore: number | null;
  /** Match footage, once someone has uploaded it. */
  filmLink: string | null;
};

export type Outcome = "W" | "L" | "D";

/**
 * Turn-by-turn directions to a game's field. Google's universal URL form
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

/**
 * `!inner` on the event: a game with no event has no date, so it can't be
 * placed on the schedule, and the season filter below needs the join anyway.
 */
const SELECT =
  "id, is_home, our_score, their_score, film_link, event:events!inner(event_date), opponent:teams(name, logo_path), field:fields(name, area, maps_address)";

/** "John Muir Field, La Jolla" — the area is dropped when the field has none. */
export const fieldLabel = (field: { name: string; area: string | null }) =>
  field.area ? `${field.name}, ${field.area}` : field.name;

function toGame(row: GameRow): Game | null {
  const event = one(row.event);
  if (!event) return null;

  const team = one(row.opponent);
  const field = one(row.field);

  return {
    id: row.id,
    kickoff: event.event_date,
    opponent: team?.name ?? "TBD",
    opponentLogo: logoUrl(team?.logo_path ?? null),
    isHome: row.is_home,
    location: field ? fieldLabel(field) : null,
    address: field?.maps_address ?? null,
    ourScore: row.our_score,
    theirScore: row.their_score,
    filmLink: row.film_link,
  };
}

/**
 * A season's games, oldest first. Without an explicit id this falls back to
 * whichever season the schedule defaults to.
 */
export const getGames = cached("games", async (
  seasonId?: string,
): Promise<Game[]> => {
  if (!supabase) return [];

  const season = seasonId
    ? { id: seasonId }
    : await getSeasonFor("games");
  if (!season) return [];

  const { data, error } = await supabase
    .from("games")
    .select(SELECT)
    .eq("event.season_id", season.id);

  if (error) throw new Error(`Failed to load games: ${error.message}`);

  // Sorted here rather than in SQL: the kickoff lives on the embedded event,
  // which can't order the parent rows in PostgREST.
  return (data as unknown as GameRow[])
    .map(toGame)
    .filter((game): game is Game => game !== null)
    .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
});

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
