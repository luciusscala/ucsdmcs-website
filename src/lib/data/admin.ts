import { compareNumbers } from "@/lib/data/roster";
import { fieldLabel } from "@/lib/data/schedule";
import { type SeasonScopedTable, populatedSeasons } from "@/lib/data/season";
import { one } from "@/lib/supabase";
import { requireAdminClient } from "@/lib/supabase-admin";
import "server-only";

export type AdminSeason = { id: string; year: number; is_current: boolean };

export type AdminTeam = {
  id: string;
  name: string;
  logo_path: string | null;
  /** How SportsEngine spells the name, when it differs from ours. */
  data_alias: string | null;
};

export type AdminField = {
  id: string;
  name: string;
  area: string | null;
  maps_address: string | null;
  recommended_parking: string | null;
  picture_path: string | null;
  /** "John Muir Field, La Jolla" — the option text in a game's field dropdown. */
  label: string;
};

export type AdminRosterEntry = {
  /** `roster.id` — the row an edit updates. */
  entryId: string;
  personId: string;
  name: string;
  hometown: string | null;
  picturePath: string | null;
  year: string;
  position: string;
  number: number | null;
};

export type AdminPractice = {
  id: string;
  eventId: string;
  date: string;
  fieldId: string;
  /** "John Muir Field, La Jolla", for the list heading. */
  field: string;
  notes: string | null;
  filmLink: string | null;
};

export type AdminSocialEvent = {
  id: string;
  eventId: string;
  date: string;
  name: string;
  description: string | null;
};

export type AdminTournament = {
  id: string;
  eventId: string;
  date: string;
  name: string;
  websiteLink: string | null;
  location: string | null;
  /** Selects the current field in the edit form's dropdown. */
  fieldId: string | null;
};

export type AdminGame = {
  id: string;
  /** `events.id` — where the kickoff lives, so an edit updates it too. */
  eventId: string;
  gameDate: string;
  isHome: boolean;
  ourScore: number | null;
  theirScore: number | null;
  filmLink: string | null;
  opponent: string;
  /** Selects the current team in the edit form's dropdown. */
  opponentId: string | null;
  /** Selects the current field in the edit form's dropdown. */
  fieldId: string | null;
};

export async function listSeasons(): Promise<AdminSeason[]> {
  const { data, error } = await requireAdminClient()
    .from("seasons")
    .select("id, year, is_current")
    .order("year", { ascending: false });

  if (error) throw new Error(`Failed to load seasons: ${error.message}`);
  return (data ?? []) as AdminSeason[];
}

export async function listTeams(): Promise<AdminTeam[]> {
  const { data, error } = await requireAdminClient()
    .from("teams")
    .select("id, name, logo_path, data_alias")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load teams: ${error.message}`);
  return (data ?? []) as AdminTeam[];
}

export async function listFields(): Promise<AdminField[]> {
  const { data, error } = await requireAdminClient()
    .from("fields")
    .select("id, name, area, maps_address, recommended_parking, picture_path")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load fields: ${error.message}`);

  return ((data ?? []) as Omit<AdminField, "label">[]).map((field) => ({
    ...field,
    label: fieldLabel(field),
  }));
}

type RosterRow = {
  id: string;
  class: string;
  position: string;
  number: number | null;
  person: {
    id: string;
    name: string;
    hometown: string | null;
    picture_path: string | null;
  } | null;
};

export async function listRoster(seasonId: string): Promise<AdminRosterEntry[]> {
  const { data, error } = await requireAdminClient()
    .from("roster")
    .select("id, class, position, number, person:people(id, name, hometown, picture_path)")
    .eq("season_id", seasonId);

  if (error) throw new Error(`Failed to load roster: ${error.message}`);

  return ((data ?? []) as unknown as RosterRow[])
    .flatMap((row) => {
      const person = one(row.person);
      if (!person) return [];
      return [
        {
          entryId: row.id,
          personId: person.id,
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
  is_home: boolean;
  our_score: number | null;
  their_score: number | null;
  film_link: string | null;
  opponent_id: string | null;
  field_id: string | null;
  event: { id: string; event_date: string } | null;
  opponent: { name: string } | null;
};

export async function listGames(seasonId: string): Promise<AdminGame[]> {
  // `!inner` so the season filter on the event drops non-matching games.
  const { data, error } = await requireAdminClient()
    .from("games")
    .select("id, is_home, our_score, their_score, film_link, opponent_id, field_id, event:events!inner(id, event_date), opponent:teams(name)")
    .eq("event.season_id", seasonId);

  if (error) throw new Error(`Failed to load games: ${error.message}`);

  // The kickoff lives on the embedded event, which can't order the parent
  // rows in PostgREST, so the sort happens here.
  return ((data ?? []) as unknown as GameRow[])
    .flatMap((row) => {
      const event = one(row.event);
      if (!event) return [];
      return [
        {
          id: row.id,
          eventId: event.id,
          gameDate: event.event_date,
          isHome: row.is_home,
          ourScore: row.our_score,
          theirScore: row.their_score,
          filmLink: row.film_link,
          opponent: one(row.opponent)?.name ?? "TBD",
          opponentId: row.opponent_id,
          fieldId: row.field_id,
        },
      ];
    })
    .sort((a, b) => Date.parse(a.gameDate) - Date.parse(b.gameDate));
}

/** The embedded event every dated table carries; `!inner` in each select. */
type EventEmbed = { event: { id: string; event_date: string } | null };

/** Oldest first. Dates live on the embedded event, so the sort happens here. */
const byDate = <T extends { date: string }>(a: T, b: T) =>
  Date.parse(a.date) - Date.parse(b.date);

type PracticeRow = EventEmbed & {
  id: string;
  field_id: string;
  notes: string | null;
  film_link: string | null;
  field: { name: string; area: string | null } | null;
};

export async function listPractices(seasonId: string): Promise<AdminPractice[]> {
  const { data, error } = await requireAdminClient()
    .from("practices")
    .select("id, field_id, notes, film_link, event:events!inner(id, event_date), field:fields(name, area)")
    .eq("event.season_id", seasonId);

  if (error) throw new Error(`Failed to load practices: ${error.message}`);

  return ((data ?? []) as unknown as PracticeRow[])
    .flatMap((row) => {
      const event = one(row.event);
      if (!event) return [];
      const field = one(row.field);
      return [
        {
          id: row.id,
          eventId: event.id,
          date: event.event_date,
          fieldId: row.field_id,
          field: field ? fieldLabel(field) : "TBD",
          notes: row.notes,
          filmLink: row.film_link,
        },
      ];
    })
    .sort(byDate);
}

type SocialEventRow = EventEmbed & {
  id: string;
  name: string;
  description: string | null;
};

export async function listSocialEvents(
  seasonId: string,
): Promise<AdminSocialEvent[]> {
  const { data, error } = await requireAdminClient()
    .from("social_events")
    .select("id, name, description, event:events!inner(id, event_date)")
    .eq("event.season_id", seasonId);

  if (error) throw new Error(`Failed to load social events: ${error.message}`);

  return ((data ?? []) as unknown as SocialEventRow[])
    .flatMap((row) => {
      const event = one(row.event);
      if (!event) return [];
      return [
        {
          id: row.id,
          eventId: event.id,
          date: event.event_date,
          name: row.name,
          description: row.description,
        },
      ];
    })
    .sort(byDate);
}

type TournamentRow = EventEmbed & {
  id: string;
  name: string;
  website_link: string | null;
  location: string | null;
  field_id: string | null;
};

export async function listTournaments(
  seasonId: string,
): Promise<AdminTournament[]> {
  const { data, error } = await requireAdminClient()
    .from("tournaments")
    .select("id, name, website_link, location, field_id, event:events!inner(id, event_date)")
    .eq("event.season_id", seasonId);

  if (error) throw new Error(`Failed to load tournaments: ${error.message}`);

  return ((data ?? []) as unknown as TournamentRow[])
    .flatMap((row) => {
      const event = one(row.event);
      if (!event) return [];
      return [
        {
          id: row.id,
          eventId: event.id,
          date: event.event_date,
          name: row.name,
          websiteLink: row.website_link,
          location: row.location,
          fieldId: row.field_id,
        },
      ];
    })
    .sort(byDate);
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
  const [seasons, populated] = await Promise.all([
    listSeasons(),
    populatedSeasons(requireAdminClient(), table),
  ]);

  const year = Number(
    Array.isArray(requestedYear) ? requestedYear[0] : requestedYear,
  );
  const asked = Number.isInteger(year)
    ? seasons.find((season) => season.year === year)
    : undefined;
  if (asked) return { seasons, season: asked };

  const current = seasons.find((season) => season.is_current);
  if (current && populated.has(current.id)) return { seasons, season: current };

  // `listSeasons` is newest-first, so this is the latest season with rows.
  const fallback = seasons.find((season) => populated.has(season.id));
  return { seasons, season: fallback ?? current ?? seasons[0] };
}
