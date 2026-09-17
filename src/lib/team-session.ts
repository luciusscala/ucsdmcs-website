import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import "server-only";

import { teamRedirect } from "@/lib/team-path";

/**
 * The web counterpart of the iOS app's `@AppStorage` keys (`teamID`,
 * `rosterID`, `phoneEntered`, `isAdmin`). There is no login: a player joins
 * with the team code, picks their own name off the roster, and enters a phone
 * number. What the app keeps on the device, the site keeps in one signed
 * cookie, so the browser can't forge a roster id or promote itself to captain.
 *
 * Signed with the same secret as the admin session; the two cookies are
 * otherwise unrelated. Captains are identified by `teams.admin_code`, the code
 * they already use in the app, not by the website's admin password.
 */
const COOKIE = "team_session";

/** A year, close to the app's forever. The cookie is re-issued on every write. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const secret = process.env.ADMIN_SESSION_SECRET;

export type TeamSession = {
  teamId: string;
  /** Null until the player has picked their name. */
  rosterId: string | null;
  /** True once a phone number has been saved, completing onboarding. */
  phoneEntered: boolean;
  captain: boolean;
};

type Stored = TeamSession & { expiresAt: number };

function sign(value: string) {
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Cookie value is `<base64url payload>.<hmac>`. */
export async function writeTeamSession(session: TeamSession) {
  const stored: Stored = {
    ...session,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(stored)).toString("base64url");

  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearTeamSession() {
  (await cookies()).delete(COOKIE);
}

/** The session as stored, or null when absent, tampered with, or expired. */
export async function readTeamSession(): Promise<TeamSession | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload))) return null;

  try {
    const stored = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as Stored;
    if (stored.expiresAt < Date.now()) return null;

    return {
      teamId: stored.teamId,
      rosterId: stored.rosterId ?? null,
      phoneEntered: Boolean(stored.phoneEntered),
      captain: Boolean(stored.captain),
    };
  } catch {
    return null;
  }
}

/** A session that has finished every onboarding step. */
export type MemberSession = TeamSession & { rosterId: string };

export const isComplete = (
  session: TeamSession | null,
): session is MemberSession =>
  session !== null && session.rosterId !== null && session.phoneEntered;

/**
 * Where an incomplete session should go next, mirroring the branches in the
 * app's `ContentView`: no team → join, no name → roster, no phone → phone.
 * Relative to the team section, since the app subdomain serves it from the
 * root — `teamRedirect` adds whichever prefix this host uses.
 */
export function nextStep(session: TeamSession | null) {
  if (!session) return "/join";
  if (!session.rosterId) return "/join/roster";
  if (!session.phoneEntered) return "/join/phone";
  return null;
}

/**
 * Guard for every member page and Server Action. Actions are reachable by
 * direct POST, so each one calls this itself rather than relying on the
 * layout — the same rule `requireAdmin()` follows.
 */
export async function requireTeamSession(): Promise<MemberSession> {
  const session = await readTeamSession();
  const step = nextStep(session);
  if (step || !isComplete(session)) return teamRedirect(step ?? "/join");
  return session;
}

/** As above, for the create/edit/delete/remind actions the app hides behind admin mode. */
export async function requireCaptain(): Promise<MemberSession> {
  const session = await requireTeamSession();
  if (!session.captain) return teamRedirect("");
  return session;
}
