import { revalidatePath, revalidateTag } from "next/cache";

import { PUBLIC_DATA } from "@/lib/data/cache";
import type { EventType } from "@/lib/data/events";
import { requireAdminClient } from "@/lib/supabase-admin";
import "server-only";

/**
 * Writes shared by the admin dashboard and the team section. Neither gate
 * lives here: every caller checks `requireAdmin()` or `requireCaptain()`
 * itself before reaching these, which is why the file is not an action file.
 */

/** Refresh every public page after a write, rather than waiting out the ISR window. */
export function revalidatePublic() {
  // The cached Supabase reads behind every public page. Without this the paths
  // below would re-render against the same stale rows.
  //
  // `expire: 0` rather than the recommended "max": this runs immediately after
  // the admin's own write, and stale-while-revalidate would hand them back the
  // row they just changed. One blocking query is the right trade here.
  revalidateTag(PUBLIC_DATA, { expire: 0 });

  // Statically rendered pages hold their own output, so they need regenerating
  // as well as re-reading. `/standings` joins crests from `teams`, so a new
  // team logo shows up there too.
  revalidatePath("/");
  revalidatePath("/standings");
  revalidatePath("/schedule");
  revalidatePath("/roster");
}

/** Tables whose rows hang off an `events` row for their season and date. */
export type EventTable = "games" | "practices" | "social_events" | "tournaments";

export const TABLE_FOR: Record<EventType, EventTable> = {
  game: "games",
  practice: "practices",
  social: "social_events",
  tournament: "tournaments",
};

export type Columns = Record<string, string | number | boolean | null>;

/**
 * Creates the event first, since the row references it, then the row. If the
 * row fails the event is removed again, so a rejected submit can't leave a
 * dateless placeholder behind. Returns an error message, or null on success.
 */
export async function insertWithEvent(
  table: EventTable,
  eventType: EventType,
  seasonId: string,
  date: string,
  columns: Columns,
) {
  const client = requireAdminClient();

  const { data: event, error: eventError } = await client
    .from("events")
    .insert({ season_id: seasonId, event_type: eventType, event_date: date })
    .select("id")
    .single();

  if (eventError) return eventError.message;

  const { error } = await client
    .from(table)
    .insert({ event_id: event.id, ...columns });

  if (error) {
    await client.from("events").delete().eq("id", event.id);
    return error.message;
  }

  return null;
}

/**
 * The date lives on the event and everything else on the row. Keyed by the
 * event because every subtype row carries a unique `event_id`, which is the id
 * both the app and the site have to hand.
 */
export async function updateWithEvent(
  table: EventTable,
  eventId: string,
  date: string,
  columns: Columns,
) {
  const client = requireAdminClient();

  const { error: eventError } = await client
    .from("events")
    .update({ event_date: date })
    .eq("id", eventId);

  if (eventError) return eventError.message;

  const { error } = await client
    .from(table)
    .update(columns)
    .eq("event_id", eventId);
  return error ? error.message : null;
}

/**
 * Row first, then the players' responses, then the event, so the foreign keys
 * to the event are satisfied at every step.
 */
export async function deleteWithEvent(table: EventTable, eventId: string) {
  const client = requireAdminClient();

  const { error } = await client.from(table).delete().eq("event_id", eventId);
  if (error) return error.message;

  const { error: availabilityError } = await client
    .from("availability")
    .delete()
    .eq("event_id", eventId);
  if (availabilityError) return availabilityError.message;

  const { error: eventError } = await client
    .from("events")
    .delete()
    .eq("id", eventId);

  return eventError ? eventError.message : null;
}
