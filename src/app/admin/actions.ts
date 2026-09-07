"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  revalidatePath("/");
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

export async function createSchool(_state: ActionState, data: FormData) {
  await requireAdmin();

  const name = text(data, "name");
  if (!name) return { error: "Name is required." };

  const logoPath = await uploadImage(data, "logo", "logos");

  const { error } = await requireAdminClient()
    .from("schools")
    .insert({ name, logo_path: logoPath });

  if (error) return { error: error.message };

  revalidatePublic();
  revalidatePath("/admin/schools");
  return null;
}

export async function createGame(_state: ActionState, data: FormData) {
  await requireAdmin();

  const seasonId = text(data, "season_id");
  const opponentId = text(data, "opponent_id");
  const gameDate = text(data, "game_date");
  if (!seasonId || !opponentId || !gameDate) {
    return { error: "Season, opponent and date are required." };
  }

  const kickoff = fromDateTimeLocal(gameDate);
  if (!kickoff) return { error: "Date is not a valid date and time." };

  const { error } = await requireAdminClient()
    .from("games")
    .insert({
      season_id: seasonId,
      opponent_id: opponentId,
      game_date: kickoff,
      is_home: data.get("is_home") === "on",
      location: text(data, "location"),
      address: text(data, "address"),
      our_score: int(data, "our_score"),
      their_score: int(data, "their_score"),
    });

  if (error) return { error: error.message };

  revalidatePublic();
  revalidatePath("/admin/schedule");
  return null;
}

/** Every field on a fixture, so a game can be corrected after it is created. */
export async function updateGame(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  const opponentId = text(data, "opponent_id");
  const gameDate = text(data, "game_date");
  if (!id || !opponentId || !gameDate) {
    return { error: "Opponent and date are required." };
  }

  const kickoff = fromDateTimeLocal(gameDate);
  if (!kickoff) return { error: "Date is not a valid date and time." };

  const { error } = await requireAdminClient()
    .from("games")
    .update({
      opponent_id: opponentId,
      game_date: kickoff,
      is_home: data.get("is_home") === "on",
      location: text(data, "location"),
      address: text(data, "address"),
      our_score: int(data, "our_score"),
      their_score: int(data, "their_score"),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePublic();
  revalidatePath("/admin/schedule");
  return null;
}

export async function deleteGame(_state: ActionState, data: FormData) {
  await requireAdmin();

  const id = text(data, "id");
  if (!id) return { error: "Missing game." };

  const { error } = await requireAdminClient().from("games").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePublic();
  revalidatePath("/admin/schedule");
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

  const { data: inserted, error: playerError } = await client
    .from("players")
    .insert({ name, hometown: text(data, "hometown"), picture_path: picturePath })
    .select("id")
    .single();

  if (playerError) return { error: playerError.message };

  const { error: seasonError } = await client.from("player_seasons").insert({
    player_id: inserted.id,
    season_id: seasonId,
    class: playerClass,
    position,
    number: int(data, "number"),
  });

  // The player row exists but has no season entry; removing it keeps the
  // tables consistent rather than leaving an orphan behind.
  if (seasonError) {
    await client.from("players").delete().eq("id", inserted.id);
    return { error: seasonError.message };
  }

  revalidatePublic();
  revalidatePath("/admin/roster");
  return null;
}

export async function updatePlayer(_state: ActionState, data: FormData) {
  await requireAdmin();
  const client = requireAdminClient();

  const playerId = text(data, "player_id");
  const entryId = text(data, "entry_id");
  const name = text(data, "name");
  if (!playerId || !entryId || !name) return { error: "Missing player." };

  const picturePath = await uploadImage(data, "picture", "player_pictures");

  const { error: playerError } = await client
    .from("players")
    .update({
      name,
      hometown: text(data, "hometown"),
      // Only overwrite the picture when a new file was actually chosen.
      ...(picturePath ? { picture_path: picturePath } : {}),
    })
    .eq("id", playerId);

  if (playerError) return { error: playerError.message };

  const { error: seasonError } = await client
    .from("player_seasons")
    .update({
      class: text(data, "class"),
      position: text(data, "position"),
      number: int(data, "number"),
    })
    .eq("id", entryId);

  if (seasonError) return { error: seasonError.message };

  revalidatePublic();
  revalidatePath("/admin/roster");
  return null;
}

/**
 * Removes a player from this season's squad.
 *
 * The `player_seasons` entry always goes. The `players` row only follows when
 * no other season still references that person, so deleting a graduate from
 * 2026 can't erase them from the 2025 roster. Deleting the season entry first
 * also keeps the foreign key satisfied at every step.
 */
export async function deletePlayer(_state: ActionState, data: FormData) {
  await requireAdmin();
  const client = requireAdminClient();

  const playerId = text(data, "player_id");
  const entryId = text(data, "entry_id");
  if (!playerId || !entryId) return { error: "Missing player." };

  const { error: entryError } = await client
    .from("player_seasons")
    .delete()
    .eq("id", entryId);

  if (entryError) return { error: entryError.message };

  const { data: remaining, error: lookupError } = await client
    .from("player_seasons")
    .select("id")
    .eq("player_id", playerId)
    .limit(1);

  if (lookupError) return { error: lookupError.message };

  if ((remaining ?? []).length === 0) {
    const { error: playerError } = await client
      .from("players")
      .delete()
      .eq("id", playerId);

    if (playerError) return { error: playerError.message };
  }

  revalidatePublic();
  revalidatePath("/admin/roster");
  return null;
}
