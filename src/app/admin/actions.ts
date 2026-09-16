"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { PUBLIC_DATA } from "@/lib/data/cache";
import { type EventType, EVENT_TYPE } from "@/lib/data/events";

import {
  checkPassword,
  endSession,
  requireAdmin,
  startSession,
} from "@/lib/admin-auth";
import { fromDateTimeLocal } from "@/lib/format";
import { requireAdminClient } from "@/lib/supabase-admin";

export type ActionState = { error?: string } | null;

/** Refresh both public pages after any write, rather than waiting out the ISR window. */
function revalidatePublic() {
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

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const int = (data: FormData, key: string) => {
  const value = text(data, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

/** Uploads to a public bucket and returns the object key, or null if no file. */
async function uploadImage(file: FormData, key: string, bucket: string) {
  const value = file.get(key);
  if (!(value instanceof File) || value.size === 0) return null;

  const extension = value.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const objectKey = `${crypto.randomUUID()}.${extension}`;

  const { error } = await requireAdminClient()
    .storage.from(bucket)
    .upload(objectKey, value, { contentType: value.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return objectKey;
}

export async function login(_state: ActionState, data: FormData) {
  const candidate = text(data, "password");
  if (!candidate || !checkPassword(candidate)) {
    return { error: "Incorrect password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function createTeam(_state: ActionState, data: FormData) {
  await requireAdmin();

  const name = text(data, "name");
  if (!name) return { error: "Name is required." };

  const logoPath = await uploadImage(data, "logo", "logos");

  const { error } = await requireAdminClient()
    .from("teams")
    .insert({ name, logo_path: logoPath, data_alias: text(data, "data_alias") });

  if (error) return { error: error.message };

  revalidatePublic();
  revalidatePath("/admin/teams");
  return null;
}

/** The text columns on a `fields` row; the photo is handled by the caller. */
function fieldColumns(data: FormData) {
  return {
    area: text(data, "area"),
    maps_address: text(data, "maps_address"),
    recommended_parking: text(data, "recommended_parking"),
  };
}

/** Every admin page with a field dropdown, plus the fields page itself. */
function revalidateFieldPages() {
  revalidatePath("/admin/fields");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/practices");
  revalidatePath("/admin/tournaments");
}

export async function createField(_state: ActionState, data: FormData) {
  await requireAdmin();

  const name = text(data, "name");
  if (!name) return { error: "Name is required." };

  const picturePath = await uploadImage(data, "picture", "field_pictures");

  const { error } = await requireAdminClient()
    .from("fields")
    .insert({ name, ...fieldColumns(data), picture_path: picturePath });

  if (error) return { error: error.message };

  // A new field changes nothing public until a game is assigned to it, so
  // only the admin pages that list fields need refreshing.
  revalidateFieldPages();
  return null;
}

export async function updateField(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const name = text(data, "name");
  if (!id || !name) return { error: "Name is required." };

  // An empty file input means "keep the current photo", not "remove it".
  const picturePath = await uploadImage(data, "picture", "field_pictures");

  const { error } = await requireAdminClient()
    .from("fields")
    .update({
      name,
      ...fieldColumns(data),
      ...(picturePath ? { picture_path: picturePath } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Unlike a create, an edit reaches every game already played on the field.
  revalidatePublic();
  revalidateFieldPages();
  return null;
}

export async function deleteField(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  if (!id) return { error: "Missing field." };

  // Games, practices and tournaments reference the field, so the database
  // refuses to delete one that is still in use; its message is shown as-is.
  const { error } = await requireAdminClient().from("fields").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePublic();
  revalidateFieldPages();
  return null;
}

/** A datetime-local value pinned to the team's zone, or null when unparseable. */
const dateTime = (data: FormData, key: string) => {
  const value = text(data, key);
  return value ? fromDateTimeLocal(value) : null;
};

/** Tables whose rows hang off an `events` row for their season and date. */
type EventTable = "games" | "practices" | "social_events" | "tournaments";

type Columns = Record<string, string | number | boolean | null>;

/**
 * Creates the event first, since the row references it, then the row. If the
 * row fails the event is removed again, so a rejected submit can't leave a
 * dateless placeholder behind. Returns an error message, or null on success.
 */
async function insertWithEvent(
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

/** The date lives on the event and everything else on the row. */
async function updateWithEvent(
  table: EventTable,
  id: string,
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

  const { error } = await client.from(table).update(columns).eq("id", id);
  return error ? error.message : null;
}

/** Row first, so the foreign key to the event is satisfied at every step. */
async function deleteWithEvent(table: EventTable, id: string, eventId: string) {
  const client = requireAdminClient();

  const { error } = await client.from(table).delete().eq("id", id);
  if (error) return error.message;

  const { error: eventError } = await client
    .from("events")
    .delete()
    .eq("id", eventId);

  return eventError ? eventError.message : null;
}

/** The columns a form can set on a `games` row; the kickoff lives on its event. */
function gameColumns(data: FormData) {
  return {
    opponent_id: text(data, "opponent_id"),
    is_home: data.get("is_home") === "on",
    field_id: text(data, "field_id"),
    our_score: int(data, "our_score"),
    their_score: int(data, "their_score"),
    film_link: text(data, "film_link"),
  };
}

export async function createGame(_state: ActionState, data: FormData) {
  await requireAdmin();

  const seasonId = text(data, "season_id");
  const opponentId = text(data, "opponent_id");
  if (!seasonId || !opponentId || !text(data, "game_date")) {
    return { error: "Season, opponent and date are required." };
  }

  const kickoff = dateTime(data, "game_date");
  if (!kickoff) return { error: "Date is not a valid date and time." };

  const error = await insertWithEvent(
    "games",
    EVENT_TYPE.game,
    seasonId,
    kickoff,
    gameColumns(data),
  );
  if (error) return { error };

  revalidatePublic();
  revalidatePath("/admin/schedule");
  return null;
}

/** Every field on a fixture, so a game can be corrected after it is created. */
export async function updateGame(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId || !text(data, "opponent_id") || !text(data, "game_date")) {
    return { error: "Opponent and date are required." };
  }

  const kickoff = dateTime(data, "game_date");
  if (!kickoff) return { error: "Date is not a valid date and time." };

  const error = await updateWithEvent("games", id, eventId, kickoff, gameColumns(data));
  if (error) return { error };

  revalidatePublic();
  revalidatePath("/admin/schedule");
  return null;
}

export async function deleteGame(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId) return { error: "Missing game." };

  const error = await deleteWithEvent("games", id, eventId);
  if (error) return { error };

  revalidatePublic();
  revalidatePath("/admin/schedule");
  return null;
}

// Practices, socials and tournaments appear nowhere on the public site, so
// their actions refresh only their own admin page.

function practiceColumns(data: FormData) {
  return {
    field_id: text(data, "field_id"),
    notes: text(data, "notes"),
    film_link: text(data, "film_link"),
  };
}

export async function createPractice(_state: ActionState, data: FormData) {
  await requireAdmin();

  const seasonId = text(data, "season_id");
  if (!seasonId || !text(data, "field_id") || !text(data, "date")) {
    return { error: "Season, field and date are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await insertWithEvent(
    "practices",
    EVENT_TYPE.practice,
    seasonId,
    date,
    practiceColumns(data),
  );
  if (error) return { error };

  revalidatePath("/admin/practices");
  return null;
}

export async function updatePractice(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId || !text(data, "field_id") || !text(data, "date")) {
    return { error: "Field and date are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await updateWithEvent("practices", id, eventId, date, practiceColumns(data));
  if (error) return { error };

  revalidatePath("/admin/practices");
  return null;
}

export async function deletePractice(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId) return { error: "Missing practice." };

  const error = await deleteWithEvent("practices", id, eventId);
  if (error) return { error };

  revalidatePath("/admin/practices");
  return null;
}

function socialEventColumns(data: FormData) {
  return {
    name: text(data, "name"),
    description: text(data, "description"),
  };
}

/**
 * `social_events.event_id` is nullable in the schema, but the dashboard always
 * creates one: without an event a social has no date and belongs to no season,
 * so nothing would list it.
 */
export async function createSocialEvent(_state: ActionState, data: FormData) {
  await requireAdmin();

  const seasonId = text(data, "season_id");
  if (!seasonId || !text(data, "name") || !text(data, "date")) {
    return { error: "Season, name and date are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await insertWithEvent(
    "social_events",
    EVENT_TYPE.social,
    seasonId,
    date,
    socialEventColumns(data),
  );
  if (error) return { error };

  revalidatePath("/admin/socials");
  return null;
}

export async function updateSocialEvent(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId || !text(data, "name") || !text(data, "date")) {
    return { error: "Name and date are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await updateWithEvent("social_events", id, eventId, date, socialEventColumns(data));
  if (error) return { error };

  revalidatePath("/admin/socials");
  return null;
}

export async function deleteSocialEvent(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId) return { error: "Missing social event." };

  const error = await deleteWithEvent("social_events", id, eventId);
  if (error) return { error };

  revalidatePath("/admin/socials");
  return null;
}

function tournamentColumns(data: FormData) {
  return {
    name: text(data, "name"),
    website_link: text(data, "website_link"),
    location: text(data, "location"),
    field_id: text(data, "field_id"),
  };
}

export async function createTournament(_state: ActionState, data: FormData) {
  await requireAdmin();

  const seasonId = text(data, "season_id");
  if (!seasonId || !text(data, "name") || !text(data, "date")) {
    return { error: "Season, name and date are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await insertWithEvent(
    "tournaments",
    EVENT_TYPE.tournament,
    seasonId,
    date,
    tournamentColumns(data),
  );
  if (error) return { error };

  revalidatePath("/admin/tournaments");
  return null;
}

export async function updateTournament(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId || !text(data, "name") || !text(data, "date")) {
    return { error: "Name and date are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await updateWithEvent("tournaments", id, eventId, date, tournamentColumns(data));
  if (error) return { error };

  revalidatePath("/admin/tournaments");
  return null;
}

export async function deleteTournament(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const eventId = text(data, "event_id");
  if (!id || !eventId) return { error: "Missing tournament." };

  const error = await deleteWithEvent("tournaments", id, eventId);
  if (error) return { error };

  revalidatePath("/admin/tournaments");
  return null;
}

export async function createPlayer(_state: ActionState, data: FormData) {
  await requireAdmin();
  const client = requireAdminClient();

  const name = text(data, "name");
  const seasonId = text(data, "season_id");
  const playerClass = text(data, "class");
  const position = text(data, "position");
  if (!name || !seasonId || !playerClass || !position) {
    return { error: "Name, season, class and position are required." };
  }

  const picturePath = await uploadImage(data, "picture", "player_pictures");

  const { data: inserted, error: personError } = await client
    .from("people")
    .insert({ name, hometown: text(data, "hometown"), picture_path: picturePath })
    .select("id")
    .single();

  if (personError) return { error: personError.message };

  const { error: rosterError } = await client.from("roster").insert({
    person_id: inserted.id,
    season_id: seasonId,
    class: playerClass,
    position,
    number: int(data, "number"),
  });

  // The person exists but is on no roster; removing them keeps the tables
  // consistent rather than leaving an orphan behind.
  if (rosterError) {
    await client.from("people").delete().eq("id", inserted.id);
    return { error: rosterError.message };
  }

  revalidatePublic();
  revalidatePath("/admin/roster");
  return null;
}

export async function updatePlayer(_state: ActionState, data: FormData) {
  await requireAdmin();
  const client = requireAdminClient();

  const personId = text(data, "person_id");
  const entryId = text(data, "entry_id");
  const name = text(data, "name");
  if (!personId || !entryId || !name) return { error: "Missing player." };

  const picturePath = await uploadImage(data, "picture", "player_pictures");

  const { error: personError } = await client
    .from("people")
    .update({
      name,
      hometown: text(data, "hometown"),
      // Only overwrite the picture when a new file was actually chosen.
      ...(picturePath ? { picture_path: picturePath } : {}),
    })
    .eq("id", personId);

  if (personError) return { error: personError.message };

  const { error: rosterError } = await client
    .from("roster")
    .update({
      class: text(data, "class"),
      position: text(data, "position"),
      number: int(data, "number"),
    })
    .eq("id", entryId);

  if (rosterError) return { error: rosterError.message };

  revalidatePublic();
  revalidatePath("/admin/roster");
  return null;
}

/**
 * Removes a player from this season's squad.
 *
 * The `roster` entry always goes. The `people` row only follows when no other
 * season still lists that person, so deleting a graduate from 2026 can't erase
 * them from the 2025 roster. Deleting the roster entry first also keeps the
 * foreign key satisfied at every step.
 */
export async function deletePlayer(_state: ActionState, data: FormData) {
  await requireAdmin();
  const client = requireAdminClient();

  const personId = text(data, "person_id");
  const entryId = text(data, "entry_id");
  if (!personId || !entryId) return { error: "Missing player." };

  const { error: entryError } = await client
    .from("roster")
    .delete()
    .eq("id", entryId);

  if (entryError) return { error: entryError.message };

  const { data: remaining, error: lookupError } = await client
    .from("roster")
    .select("id")
    .eq("person_id", personId)
    .limit(1);

  if (lookupError) return { error: lookupError.message };

  if ((remaining ?? []).length === 0) {
    const { error: personError } = await client
      .from("people")
      .delete()
      .eq("id", personId);

    if (personError) return { error: personError.message };
  }

  revalidatePublic();
  revalidatePath("/admin/roster");
  return null;
}
