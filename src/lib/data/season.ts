import { cache } from "react";

import { supabase } from "@/lib/supabase";

export type Season = {
  id: string;
  year: number;
};

/** Tables that carry a `season_id` and are displayed a season at a time. */
export type SeasonScopedTable = "games" | "player_seasons";

type SeasonRow = Season & { is_current: boolean };

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
export const listSeasons = cache(async (): Promise<Season[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("seasons")
    .select("id, year")
    .order("year", { ascending: false });

  if (error) throw new Error(`Failed to load seasons: ${error.message}`);
  return (data ?? []) as Season[];
});

/** Resolves a `?season=` year to a real season, or null when it matches none. */
export const getSeasonByYear = cache(async (year: number) => {
  const seasons = await listSeasons();
  return seasons.find((season) => season.year === year) ?? null;
});

export const getSeasonFor = cache(
  async (table: SeasonScopedTable): Promise<Season | null> => {
    if (!supabase) return null;

    const [seasons, rows] = await Promise.all([
      supabase
        .from("seasons")
        .select("id, year, is_current")
        .order("year", { ascending: false }),
      supabase.from(table).select("season_id"),
    ]);

    if (seasons.error) {
      throw new Error(`Failed to load seasons: ${seasons.error.message}`);
    }
    if (rows.error) {
      throw new Error(`Failed to load ${table} seasons: ${rows.error.message}`);
    }

    const all = (seasons.data ?? []) as SeasonRow[];
    if (all.length === 0) {
      console.warn("No rows in `seasons`.");
      return null;
    }

    const populated = new Set(
      ((rows.data ?? []) as { season_id: string }[]).map((row) => row.season_id),
    );
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
  },
);
