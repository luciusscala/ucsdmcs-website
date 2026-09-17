import type { AvailabilityStatus } from "@/lib/data/availability";
import { compareNumbers } from "@/lib/data/roster";
import { fieldLabel } from "@/lib/data/schedule";
import type { EventType } from "@/lib/data/events";
import { dayKey, formatDayHeading } from "@/lib/format";
import { logoUrl, one } from "@/lib/supabase";
import { requireAdminClient } from "@/lib/supabase-admin";
import "server-only";

/**
 * Reads for the team section — the web port of the iOS app's `DataService`.
 *
 * Uses the secret-key client because `availability` and the practice, social
 * and tournament tables have no public read policy, and because every page
 * here sits behind `requireTeamSession()` anyway. Nothing in this file is
 * cached: availability changes by the minute and the pages are per-player.
 *
 * Where the app fetches one subtype and one availability list per event, the
 * site fetches each table once for the whole schedule.
 */

export type { AvailabilityStatus } from "@/lib/data/availability";

export type Season = { id: string; year: number };

export type TeamSummary = { id: string; name: string };

/** One roster row with its person, as the app's `RosterEntry` + `Person`. */
export type Member = {
  rosterId: string;
  personId: string;
  name: string;
  number: number | null;
  hometown: string | null;
  phone: string | null;
};

/** One `availability` row, with the member it belongs to resolved. */
export type Response = {
  rosterId: string;
  status: AvailabilityStatus;
};

/** The app's `EventWithAvailability`, flattened to what the pages render. */
export type TeamEvent = {
  id: string;
  type: EventType;
  /** ISO 8601, from `events.event_date`. */
  date: string;
  /** "Practice", "vs. UCLA", the social's name, the tournament's name. */
  title: string;
  location: string | null;
  /** The field's map address, for a directions link. */
  address: string | null;
  notes: string | null;
  opponentLogo: string | null;
  /** Home/away, games only. */
  isHome: boolean | null;
  /** What the edit forms need, present only for the matching type. */
  practice: { fieldId: string; notes: string | null } | null;
  game: { opponentId: string | null; fieldId: string | null; isHome: boolean } | null;
};

const client = () => requireAdminClient();

// MARK: Season, team, roster

export async function getCurrentSeason(): Promise<Season | null> {
  const { data, error } = await client()
    .from("seasons")
    .select("id, year")
    .eq("is_current", true)
    .limit(1);

  if (error) throw new Error(`Failed to load season: ${error.message}`);
  return (data?.[0] as Season | undefined) ?? null;
}

/**
 * Case-insensitive: the app's keyboard capitalises the code as it's typed, a
 * laptop's doesn't, and a code is a code either way. `ilike` treats `%` and
 * `_` as wildcards, so they're escaped out of the input first.
 */
export async function getTeamByCode(code: string): Promise<TeamSummary | null> {
  const pattern = code.replace(/[\\%_]/g, "\\$&");
  const { data, error } = await client()
    .from("teams")
    .select("id, name")
    .ilike("team_code", pattern)
    .limit(1);

  if (error) throw new Error(`Failed to look up team: ${error.message}`);
  return (data?.[0] as TeamSummary | undefined) ?? null;
}

/** The captain code for a team, or null when the team doesn't exist. */
export async function getAdminCode(teamId: string): Promise<string | null> {
  const { data, error } = await client()
    .from("teams")
    .select("admin_code")
    .eq("id", teamId)
    .limit(1);

  if (error) throw new Error(`Failed to load team: ${error.message}`);
  return (data?.[0] as { admin_code: string | null } | undefined)?.admin_code ?? null;
}

type RosterRow = {
  id: string;
  number: number | null;
  person: {
    id: string;
    name: string;
    hometown: string | null;
    phone: string | null;
  } | null;
};

/** The season's squad, by number with unnumbered players last, then by name. */
export async function getRoster(seasonId: string): Promise<Member[]> {
  const { data, error } = await client()
    .from("roster")
    .select("id, number, person:people(id, name, hometown, phone)")
    .eq("season_id", seasonId);

  if (error) throw new Error(`Failed to load roster: ${error.message}`);

  return ((data ?? []) as unknown as RosterRow[])
    .flatMap((row) => {
      const person = one(row.person);
      if (!person) return [];
      return [
        {
          rosterId: row.id,
          personId: person.id,
          name: person.name,
          number: row.number,
          hometown: person.hometown,
          phone: person.phone,
        },
      ];
    })
    .sort(
      (a, b) =>
        compareNumbers(a.number, b.number) || a.name.localeCompare(b.name),
    );
}

// MARK: Events

type EventRow = {
  id: string;
  event_type: EventType;
  event_date: string;
};

type FieldEmbed = { name: string; area: string | null; maps_address: string | null } | null;

type PracticeRow = {
  event_id: string;
  field_id: string;
  notes: string | null;
  field: FieldEmbed;
};

type GameRow = {
  event_id: string;
  opponent_id: string | null;
  field_id: string | null;
  is_home: boolean;
  field: FieldEmbed;
  opponent: { name: string; logo_path: string | null } | null;
};

type SocialRow = { event_id: string; name: string };

type TournamentRow = {
  event_id: string;
  name: string;
  location: string | null;
  field: FieldEmbed;
};

/**
 * Fills in the subtype half of each event. One query per subtype table,
 * filtered to the ids at hand, rather than one per event as the app does.
 */
async function withSubtypes(rows: EventRow[]): Promise<TeamEvent[]> {
  if (rows.length === 0) return [];

  const idsOf = (type: EventType) =>
    rows.filter((row) => row.event_type === type).map((row) => row.id);

  const db = client();

  const query = async <T,>(
    table: string,
    select: string,
    ids: string[],
  ): Promise<T[]> => {
    if (ids.length === 0) return [];
    const { data, error } = await db.from(table).select(select).in("event_id", ids);
    if (error) throw new Error(`Failed to load ${table}: ${error.message}`);
    return (data ?? []) as unknown as T[];
  };

  const [practices, games, socials, tournaments] = await Promise.all([
    query<PracticeRow>(
      "practices",
      "event_id, field_id, notes, field:fields(name, area, maps_address)",
      idsOf("practice"),
    ),
    query<GameRow>(
      "games",
      "event_id, opponent_id, field_id, is_home, field:fields(name, area, maps_address), opponent:teams!games_opponent_id_fkey(name, logo_path)",
      idsOf("game"),
    ),
    query<SocialRow>("social_events", "event_id, name", idsOf("social")),
    query<TournamentRow>(
      "tournaments",
      "event_id, name, location, field:fields(name, area, maps_address)",
      idsOf("tournament"),
    ),
  ]);

  const byEvent = <T extends { event_id: string }>(list: T[]) =>
    new Map(list.map((row) => [row.event_id, row]));

  const practiceOf = byEvent(practices);
  const gameOf = byEvent(games);
  const socialOf = byEvent(socials);
  const tournamentOf = byEvent(tournaments);

  const base = (row: EventRow): TeamEvent => ({
    id: row.id,
    type: row.event_type,
    date: row.event_date,
    title: "",
    location: null,
    address: null,
    notes: null,
    opponentLogo: null,
    isHome: null,
    practice: null,
    game: null,
  });

  return rows.map((row) => {
    const event = base(row);

    switch (row.event_type) {
      case "practice": {
        const practice = practiceOf.get(row.id);
        const field = one(practice?.field);
        event.title = "Practice";
        event.location = field ? fieldLabel(field) : null;
        event.address = field?.maps_address ?? null;
        event.notes = practice?.notes ?? null;
        if (practice) {
          event.practice = { fieldId: practice.field_id, notes: practice.notes };
        }
        break;
      }
      case "game": {
        const game = gameOf.get(row.id);
        const field = one(game?.field);
        const opponent = one(game?.opponent);
        const isHome = game?.is_home ?? true;
        event.title = `${isHome ? "vs." : "@"} ${opponent?.name ?? "TBD"}`;
        event.location = field ? fieldLabel(field) : null;
        event.address = field?.maps_address ?? null;
        event.opponentLogo = logoUrl(opponent?.logo_path ?? null);
        event.isHome = isHome;
        if (game) {
          event.game = {
            opponentId: game.opponent_id,
            fieldId: game.field_id,
            isHome,
          };
        }
        break;
      }
      case "social": {
        event.title = socialOf.get(row.id)?.name ?? "Social Event";
        break;
      }
      case "tournament": {
        const tournament = tournamentOf.get(row.id);
        const field = one(tournament?.field);
        event.title = tournament?.name ?? "Tournament";
        event.location = tournament?.location ?? (field ? fieldLabel(field) : null);
        event.address = field?.maps_address ?? null;
        break;
      }
    }

    return event;
  });
}

/** Everything from now on in the current season, soonest first. */
export async function getUpcomingEvents(seasonId: string): Promise<TeamEvent[]> {
  const { data, error } = await client()
    .from("events")
    .select("id, event_type, event_date")
    .eq("season_id", seasonId)
    .gte("event_date", new Date().toISOString())
    .order("event_date");

  if (error) throw new Error(`Failed to load events: ${error.message}`);
  return withSubtypes((data ?? []) as EventRow[]);
}

/**
 * One event by id, past or future. The app only ever lists upcoming events,
 * but a reminder link can outlive the event it points at, and a page that
 * still renders beats one that spins.
 */
export async function getEvent(eventId: string): Promise<TeamEvent | null> {
  const { data, error } = await client()
    .from("events")
    .select("id, event_type, event_date")
    .eq("id", eventId)
    .limit(1);

  if (error) throw new Error(`Failed to load event: ${error.message}`);
  const [event] = await withSubtypes((data ?? []) as EventRow[]);
  return event ?? null;
}

// MARK: Availability

type AvailabilityRow = {
  event_id: string;
  roster_id: string;
  status: AvailabilityStatus;
};

/** Every response for the given events, grouped by event. */
export async function getAvailability(
  eventIds: string[],
): Promise<Map<string, Response[]>> {
  const grouped = new Map<string, Response[]>();
  if (eventIds.length === 0) return grouped;

  const { data, error } = await client()
    .from("availability")
    .select("event_id, roster_id, status")
    .in("event_id", eventIds);

  if (error) throw new Error(`Failed to load availability: ${error.message}`);

  for (const row of (data ?? []) as AvailabilityRow[]) {
    const list = grouped.get(row.event_id) ?? [];
    list.push({ rosterId: row.roster_id, status: row.status });
    grouped.set(row.event_id, list);
  }

  return grouped;
}

/** Members who have not answered for an event — the app's `rosterWithoutResponse`. */
export function withoutResponse(roster: Member[], responses: Response[]) {
  const answered = new Set(responses.map((response) => response.rosterId));
  return roster.filter((member) => !answered.has(member.rosterId));
}

// MARK: Grouping

export type DayGroup = { key: string; heading: string; events: TeamEvent[] };

/** Events under one heading per calendar day in the team's zone, soonest first. */
export function groupByDay(events: TeamEvent[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  for (const event of events) {
    const key = dayKey(event.date);
    const group = groups.get(key) ?? {
      key,
      heading: formatDayHeading(event.date),
      events: [],
    };
    group.events.push(event);
    groups.set(key, group);
  }

  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}
