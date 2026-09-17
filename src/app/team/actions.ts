"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { EVENT_TYPE } from "@/lib/data/events";
import {
  TABLE_FOR,
  deleteWithEvent,
  insertWithEvent,
  revalidatePublic,
  updateWithEvent,
} from "@/lib/data/events-write";
import { type AvailabilityStatus, isStatus } from "@/lib/data/availability";
import {
  getAdminCode,
  getCurrentSeason,
  getEvent,
  getRoster,
  getTeamByCode,
} from "@/lib/data/team";
import { fromDateTimeLocal } from "@/lib/format";
import { requireAdminClient } from "@/lib/supabase-admin";
import {
  clearTeamSession,
  readTeamSession,
  requireCaptain,
  requireTeamSession,
  writeTeamSession,
} from "@/lib/team-session";

/** Same shape as the admin actions, so `AdminForm` serves both sections. */
export type ActionState = { error?: string } | null;

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

/** Every page under /team, in one call. Writes here are small enough that
 *  refreshing the whole section beats tracking which page shows what. */
const revalidateTeam = () => revalidatePath("/team", "layout");

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

// MARK: Onboarding — the app's TeamSelection → RosterSelection → PhoneNumberEntry

export async function joinTeam(_state: ActionState, data: FormData) {
  const code = text(data, "team_code");
  if (!code) return { error: "Enter your team code." };

  const team = await getTeamByCode(code);
  if (!team) return { error: "Invalid team code. Please try again." };

  await writeTeamSession({
    teamId: team.id,
    rosterId: null,
    phoneEntered: false,
    captain: false,
  });
  redirect("/team/join/roster");
}

/**
 * A tap on a name is the whole step. The list is server-rendered from the
 * roster, so an id that doesn't match can only be a forged request; it just
 * lands back on the list.
 */
export async function selectRoster(data: FormData) {
  const session = await readTeamSession();
  if (!session) redirect("/team/join");

  const rosterId = text(data, "roster_id");
  const season = await getCurrentSeason();
  const member = season
    ? (await getRoster(season.id)).find((entry) => entry.rosterId === rosterId)
    : undefined;
  if (!member) redirect("/team/join/roster");

  // A player who already gave the app their number isn't asked twice.
  const phoneEntered = Boolean(member.phone);

  await writeTeamSession({ ...session, rosterId: member.rosterId, phoneEntered });
  redirect(phoneEntered ? "/team" : "/team/join/phone");
}

export async function savePhone(_state: ActionState, data: FormData) {
  const session = await readTeamSession();
  if (!session?.rosterId) redirect("/team/join");

  // Digits only, as the app stores it. Ten is a US number without the
  // country code; eleven starting with 1 is the same number with it.
  const phone = (text(data, "phone") ?? "").replace(/\D/g, "");
  if (phone.length < 10) return { error: "Enter a 10-digit phone number." };

  const season = await getCurrentSeason();
  const member = season
    ? (await getRoster(season.id)).find((entry) => entry.rosterId === session.rosterId)
    : undefined;
  if (!member) return { error: "Your roster entry could not be found." };

  const { error } = await requireAdminClient()
    .from("people")
    .update({ phone })
    .eq("id", member.personId);
  if (error) return { error: error.message };

  await writeTeamSession({ ...session, phoneEntered: true });
  redirect("/team");
}

// MARK: Availability

/**
 * Called straight from the picker rather than through a form, so the client
 * can show the tap immediately and settle it afterwards.
 */
export async function setAvailability(eventId: string, status: AvailabilityStatus) {
  const session = await requireTeamSession();
  if (!isStatus(status)) return;

  const { error } = await requireAdminClient()
    .from("availability")
    .upsert(
      { event_id: eventId, roster_id: session.rosterId, status },
      { onConflict: "event_id,roster_id" },
    );
  if (error) throw new Error(error.message);

  revalidateTeam();
}

/**
 * The selection bar's one action. `intent` is the button that submitted:
 * "yes" or "no" marks every checked event, "delete" removes them (captains).
 */
export async function bulkAction(_state: ActionState, data: FormData) {
  const session = await requireTeamSession();

  const eventIds = data
    .getAll("event_id")
    .filter((value): value is string => typeof value === "string" && value !== "");
  if (eventIds.length === 0) return { error: "Select at least one event." };

  const intent = text(data, "intent");

  if (intent === "delete") {
    if (!session.captain) return { error: "Only captains can delete events." };

    for (const eventId of eventIds) {
      const event = await getEvent(eventId);
      if (!event) continue;
      const error = await deleteWithEvent(TABLE_FOR[event.type], eventId);
      if (error) return { error };
      if (event.type === "game") revalidatePublic();
    }

    revalidateTeam();
    return null;
  }

  if (!isStatus(intent)) return { error: "Choose Going or Not Going." };

  const { error } = await requireAdminClient()
    .from("availability")
    .upsert(
      eventIds.map((eventId) => ({
        event_id: eventId,
        roster_id: session.rosterId,
        status: intent,
      })),
      { onConflict: "event_id,roster_id" },
    );
  if (error) return { error: error.message };

  revalidateTeam();
  return null;
}

// MARK: Settings

export async function updateHometown(_state: ActionState, data: FormData) {
  const session = await requireTeamSession();

  const season = await getCurrentSeason();
  const member = season
    ? (await getRoster(season.id)).find((entry) => entry.rosterId === session.rosterId)
    : undefined;
  if (!member) return { error: "Your roster entry could not be found." };

  const { error } = await requireAdminClient()
    .from("people")
    .update({ hometown: text(data, "hometown") ?? "" })
    .eq("id", member.personId);
  if (error) return { error: error.message };

  revalidateTeam();
  return null;
}

export async function unlockCaptain(_state: ActionState, data: FormData) {
  const session = await requireTeamSession();

  const code = text(data, "admin_code");
  if (!code) return { error: "Enter the admin code." };

  const expected = await getAdminCode(session.teamId);
  if (!expected || !safeEqual(code, expected)) {
    return { error: "Invalid admin code." };
  }

  await writeTeamSession({ ...session, captain: true });
  revalidateTeam();
  return null;
}

export async function disableCaptain() {
  const session = await requireTeamSession();
  await writeTeamSession({ ...session, captain: false });
  revalidateTeam();
}

/** The app's "Leave Team": forget everything and start over. */
export async function leaveTeam() {
  await clearTeamSession();
  redirect("/team/join");
}

/** The same, in the shape `AdminForm` wants so it can ask for confirmation. */
export async function leaveTeamConfirmed(): Promise<ActionState> {
  await leaveTeam();
  return null;
}

// MARK: Captain — events

/** A datetime-local value pinned to the team's zone, or null when unparseable. */
const dateTime = (data: FormData, key: string) => {
  const value = text(data, key);
  return value ? fromDateTimeLocal(value) : null;
};

/** The columns the app's practice form sets; the date lives on the event. */
const practiceColumns = (data: FormData) => ({
  field_id: text(data, "field_id"),
  notes: text(data, "notes"),
});

const gameColumns = (data: FormData) => ({
  opponent_id: text(data, "opponent_id"),
  field_id: text(data, "field_id"),
  is_home: data.get("is_home") === "on",
});

export async function createPractice(_state: ActionState, data: FormData) {
  await requireCaptain();

  const season = await getCurrentSeason();
  if (!season) return { error: "No current season." };
  if (!text(data, "field_id")) return { error: "Choose a field." };

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await insertWithEvent(
    "practices",
    EVENT_TYPE.practice,
    season.id,
    date,
    practiceColumns(data),
  );
  if (error) return { error };

  revalidateTeam();
  redirect("/team");
}

/**
 * The app's repeating form: every chosen weekday between two dates, at one
 * time, on one field. Dates are walked in UTC purely as calendar arithmetic;
 * each one is then pinned to the team's zone like any other form date.
 */
export async function createRepeatingPractices(_state: ActionState, data: FormData) {
  await requireCaptain();

  const season = await getCurrentSeason();
  if (!season) return { error: "No current season." };

  const days = new Set(
    data.getAll("day").map(Number).filter((day) => Number.isInteger(day)),
  );
  const start = text(data, "start_date");
  const end = text(data, "end_date");
  const time = text(data, "time");
  const fieldId = text(data, "field_id");

  if (days.size === 0) return { error: "Choose at least one day of the week." };
  if (!start || !end || !time || !fieldId) {
    return { error: "Dates, time and field are required." };
  }
  if (end < start) return { error: "The end date is before the start date." };

  const parse = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  const DAY_MS = 86_400_000;

  const dates: string[] = [];
  for (let at = parse(start); at <= parse(end); at += DAY_MS) {
    const cursor = new Date(at);
    if (!days.has(cursor.getUTCDay())) continue;
    const iso = fromDateTimeLocal(`${cursor.toISOString().slice(0, 10)}T${time}`);
    if (iso) dates.push(iso);
  }
  if (dates.length === 0) return { error: "No practices fall in that range." };
  if (dates.length > 100) return { error: "That would create more than 100 practices." };

  const columns = practiceColumns(data);
  for (const date of dates) {
    const error = await insertWithEvent(
      "practices",
      EVENT_TYPE.practice,
      season.id,
      date,
      columns,
    );
    if (error) return { error };
  }

  revalidateTeam();
  redirect("/team");
}

export async function createGame(_state: ActionState, data: FormData) {
  await requireCaptain();

  const season = await getCurrentSeason();
  if (!season) return { error: "No current season." };
  if (!text(data, "opponent_id") || !text(data, "field_id")) {
    return { error: "Opponent and field are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await insertWithEvent(
    "games",
    EVENT_TYPE.game,
    season.id,
    date,
    gameColumns(data),
  );
  if (error) return { error };

  revalidatePublic();
  revalidateTeam();
  redirect("/team");
}

export async function updatePractice(_state: ActionState, data: FormData) {
  await requireCaptain();

  const eventId = text(data, "event_id");
  if (!eventId) return { error: "Missing practice." };
  if (!text(data, "field_id")) return { error: "Choose a field." };

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await updateWithEvent("practices", eventId, date, {
    ...practiceColumns(data),
    // An emptied notes field clears the note, as the app does.
    notes: text(data, "notes") ?? "",
  });
  if (error) return { error };

  revalidateTeam();
  redirect(`/team/events/${eventId}`);
}

export async function updateGame(_state: ActionState, data: FormData) {
  await requireCaptain();

  const eventId = text(data, "event_id");
  if (!eventId) return { error: "Missing game." };
  if (!text(data, "opponent_id") || !text(data, "field_id")) {
    return { error: "Opponent and field are required." };
  }

  const date = dateTime(data, "date");
  if (!date) return { error: "Date is not a valid date and time." };

  const error = await updateWithEvent("games", eventId, date, gameColumns(data));
  if (error) return { error };

  revalidatePublic();
  revalidateTeam();
  redirect(`/team/events/${eventId}`);
}

export async function deleteEvent(_state: ActionState, data: FormData) {
  await requireCaptain();

  const eventId = text(data, "event_id");
  const event = eventId ? await getEvent(eventId) : null;
  if (!eventId || !event) return { error: "Missing event." };

  const error = await deleteWithEvent(TABLE_FOR[event.type], eventId);
  if (error) return { error };

  if (event.type === "game") revalidatePublic();
  revalidateTeam();
  redirect("/team");
}

// MARK: Captain — reminders

/**
 * Where the SMS backend lives. A placeholder until the FastAPI service is
 * deployed, exactly as `MessageService.baseURL` is in the app; the request
 * shape matches its `/send-sms` too, so both clients move together.
 */
const MESSAGE_API_URL =
  process.env.MESSAGE_API_URL ?? "https://your-api.railway.app";

export type ReminderState = { error?: string; sent?: number } | null;

export async function sendReminder(
  _state: ReminderState,
  data: FormData,
): Promise<ReminderState> {
  const session = await requireCaptain();

  const message = text(data, "message");
  if (!message) return { error: "Write a message." };

  const rosterIds = new Set(
    data.getAll("roster_id").filter((value): value is string => typeof value === "string"),
  );
  if (rosterIds.size === 0) return { error: "Select at least one player." };

  const season = await getCurrentSeason();
  const roster = season ? await getRoster(season.id) : [];
  const phones = roster
    .filter((member) => rosterIds.has(member.rosterId))
    .map((member) => member.phone)
    .filter((phone): phone is string => Boolean(phone));
  if (phones.length === 0) return { error: "None of the selected players has a phone number." };

  let response: Response;
  try {
    response = await fetch(`${MESSAGE_API_URL}/send-sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: session.teamId, phones, message }),
    });
  } catch (error) {
    return { error: `Could not reach the messaging server: ${(error as Error).message}` };
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return { error: `Server error: ${body || response.statusText}` };
  }

  return { sent: phones.length };
}
