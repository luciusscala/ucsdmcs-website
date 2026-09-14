import { cache } from "react";

import { cached } from "@/lib/data/cache";
import { one, supabase } from "@/lib/supabase";

export type Season = {
  id: string;
  year: number;
};

/**
 * Tables displayed a season at a time. `roster` carries `season_id` itself;
 * the rest reach their season through the event they are scheduled on.
 */
export type SeasonScopedTable =
  | "games"
  | "practices"
  | "social_events"
  | "tournaments"
  | "roster";

type SeasonRow = Season & { is_current: boolean };

type Client = NonNullable<typeof supabase>;

/**
 * Ids of every season a table has rows for. Takes the client as an argument
 * so the admin, which resolves its season the same way, can run it with its
 * own write client.
 */
export async function populatedSeasons(
  client: Client,
  table: SeasonScopedTable,
): Promise<Set<string>> {
  if (table === "roster") {
    const { data, error } = await client.from("roster").select("season_id");
    if (error) throw new Error(`Failed to load roster seasons: ${error.message}`);
    return new Set(
      ((data ?? []) as { season_id: string }[]).map((row) => row.season_id),
    );
  }

  // `!inner` drops rows with no event: they have no season, and no date to
  // show either.
  const { data, error } = await client
    .from(table)
    .select("event:events!inner(season_id)");
  if (error) throw new Error(`Failed to load ${table} seasons: ${error.message}`);

  return new Set(
    ((data ?? []) as unknown as { event: { season_id: string } | null }[]).flatMap(
      (row) => {
        const event = one(row.event);
        return event ? [event.season_id] : [];
      },
    ),
  );
}

/**
 * The season a given section should display.
 *
 * Sections resolve independently, the way athletics sites generally work: a
 * new schedule goes up as soon as fixtures are announced, while the roster
 * stays on last season until the squad is finalised. Preference order is the
 * season flagged `is_current` when it actually has rows, then the most recent
 * season that does.
 *
 * Whatever this returns is what the page heading names, so a section showing
 * last season always says so.
 */
/** Every season, newest first — the options in the schedule's year picker. */
export const listSeasons = cache(cached("seasons", async (): Promise<Season[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("seasons")
    .select("id, year")
    .order("year", { ascending: false });

  if (error) throw new Error(`Failed to load seasons: ${error.message}`);
  return (data ?? []) as Season[];
}));

/** Resolves a `?season=` year to a real season, or null when it matches none. */
export const getSeasonByYear = cache(async (year: number) => {
  const seasons = await listSeasons();
  return seasons.find((season) => season.year === year) ?? null;
});

export const getSeasonFor = cache(
  cached("season-for", async (table: SeasonScopedTable): Promise<Season | null> => {
    if (!supabase) return null;

    const [seasons, populated] = await Promise.all([
      supabase
        .from("seasons")
        .select("id, year, is_current")
        .order("year", { ascending: false }),
      populatedSeasons(supabase, table),
    ]);

    if (seasons.error) {
      throw new Error(`Failed to load seasons: ${seasons.error.message}`);
    }

    const all = (seasons.data ?? []) as SeasonRow[];
    if (all.length === 0) {
      console.warn("No rows in `seasons`.");
      return null;
    }

    const strip = ({ id, year }: SeasonRow): Season => ({ id, year });

    const current = all.find((season) => season.is_current);
    if (current && populated.has(current.id)) return strip(current);

    // `all` is already newest-first, so this is the latest season with rows.
    const populatedSeason = all.find((season) => populated.has(season.id));
    if (populatedSeason) {
      console.warn(
        `No ${table} for the current season; showing ${populatedSeason.year}.`,
      );
      return strip(populatedSeason);
    }

    // Nothing anywhere: fall back to the current season so the page still
    // names a year alongside its empty state.
    return strip(current ?? all[0]);
  }),
);
