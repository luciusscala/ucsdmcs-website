import { logoUrl, supabase } from "@/lib/supabase";

/**
 * The SoCal division of College Club Soccer — Men, as the league publishes
 * it on its SportsEngine microsite:
 *
 *   https://season-microsites.ui.sportsengine.com/seasons/6a0c976961444a4e0cf2ef71/divisions/6a0c980026aee3a5643b3edf?divisionTab=standings
 *
 * That page is an Angular app which renders nothing server-side, so there is no
 * markup to scrape. These are the ids its own bundle hands to the public JSON
 * endpoint below, which needs no key.
 */
const PROGRAM_ID = "6a0c976961444a4e0cf2ef71";
const FLIGHT_ID = "6a0c980026aee3a5643b3edf";
const ENDPOINT = "https://se-api.sportsengine.com/v3/microsites/standings";

/**
 * Once a day. Results are entered by league admins long after the final
 * whistle, so anything more frequent just adds load without adding news.
 * `src/app/standings/page.tsx` holds the matching segment-level value.
 */
export const REVALIDATE_SECONDS = 86_400;

/** Only the fields this table shows; the payload carries several more. */
type Values = Record<string, number | string | null>;

type StandingsResponse = {
  result?: {
    teamRecords?: {
      team_id?: string;
      team_name?: string;
      team_short_name?: string;
      values?: Values;
    }[];
  }[];
};

export type TeamRecord = {
  id: string;
  name: string;
  /** Resolved crest URL, or null when no school matches. */
  logo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** Marks our own row, so the table can pick it out of the seven. */
  isUs: boolean;
};

/**
 * Every value in the payload is nullable and `div` is a string, so a bad or
 * absent field reads as zero rather than rendering "NaN" or "null" in a cell.
 */
const num = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

/** Case, punctuation and spacing differ between the two sources; nothing else. */
const normalize = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Genuine disagreements between what SportsEngine calls a school and what
 * `schools.name` calls it. Everything else matches once normalised, so this
 * stays short by design — an entry here means the two really do differ.
 *
 * Applied to both sides, so either spelling resolves to the same key.
 */
const ALIASES: Record<string, string> = {
  "loyola marymount": "lmu",
};

const schoolKey = (name: string) => {
  const key = normalize(name);
  return ALIASES[key] ?? key;
};

/**
 * Us. Only used to mark our own row — our crest comes out of `schools`
 * along with everyone else's, so this table treats all seven teams alike.
 */
const UCSD = schoolKey("UC San Diego");

/** Crests by normalised school name. Empty when Supabase isn't configured,
 *  which degrades to monograms rather than failing the page. */
async function schoolLogos(): Promise<Map<string, string>> {
  if (!supabase) return new Map();

  const { data, error } = await supabase.from("schools").select("name, logo_path");
  if (error) throw new Error(`Failed to load schools: ${error.message}`);

  const logos = new Map<string, string>();

  for (const school of (data ?? []) as {
    name: string;
    logo_path: string | null;
  }[]) {
    const url = logoUrl(school.logo_path);
    if (url) logos.set(schoolKey(school.name), url);
  }

  return logos;
}

/**
 * The division's own published criteria: points, then goal difference, goals
 * scored, and fewest conceded.
 *
 * Head-to-head is the league's real first tiebreaker but can't be derived from
 * this endpoint, so exact ties fall back to the order SportsEngine sent, which
 * is where that tiebreak lives once applied. `sort` is stable, so that fallback
 * is guaranteed rather than incidental.
 */
const compare = (a: TeamRecord, b: TeamRecord) =>
  b.points - a.points ||
  b.goalDifference - a.goalDifference ||
  b.goalsFor - a.goalsFor ||
  a.goalsAgainst - b.goalsAgainst;

/**
 * The division table, best first. Throws on a bad response so a transient
 * SportsEngine failure isn't cached as an empty table for the day.
 */
export async function getStandings(): Promise<TeamRecord[]> {
  const [response, logos] = await Promise.all([
    fetch(`${ENDPOINT}?program_id=${PROGRAM_ID}&flight_id=${FLIGHT_ID}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    }),
    schoolLogos(),
  ]);

  if (!response.ok) {
    throw new Error(
      `Standings request failed: ${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as StandingsResponse;

  // One node per stage. This division runs a single "Game Play" stage with no
  // child nodes; taking the first keeps a team from appearing twice should the
  // league ever add a playoff stage alongside it.
  const records = body.result?.[0]?.teamRecords ?? [];

  return records
    .map((record): TeamRecord => {
      const name = record.team_name ?? record.team_short_name ?? "TBD";
      const key = schoolKey(name);
      const values = record.values ?? {};

      return {
        id: record.team_id ?? name,
        name,
        logo: logos.get(key) ?? null,
        played: num(values.games),
        won: num(values.w),
        drawn: num(values.t),
        lost: num(values.l),
        goalsFor: num(values.pf),
        goalsAgainst: num(values.pa),
        goalDifference: num(values.pd),
        points: num(values.st_pts),
        isUs: key === UCSD,
      };
    })
    .sort(compare);
}

/** "+4", "-2", "0" — a table of bare numbers reads ambiguously without the sign. */
export const formatDifference = (difference: number) =>
  difference > 0 ? `+${difference}` : String(difference);

/**
 * How the league names this division and season, for the page heading. Both
 * describe the microsite that PROGRAM_ID and FLIGHT_ID point at.
 */
export const DIVISION = "SoCal";
export const SEASON_YEAR = 2026;

/** The league's own standings page, linked as the source. */
export const MICROSITE_URL = `https://season-microsites.ui.sportsengine.com/seasons/${PROGRAM_ID}/divisions/${FLIGHT_ID}?divisionTab=standings`;
