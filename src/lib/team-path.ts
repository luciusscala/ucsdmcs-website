import { headers } from "next/headers";
import { redirect } from "next/navigation";

import "server-only";

import { TEAM_SECTION, isAppHost, teamPath } from "@/lib/app-host";

/**
 * How this host spells links into the team app: "" on app.ucsdmcs.com, where
 * the section is the whole site, and "/team" on the club site.
 *
 * Middleware would fix a wrongly-prefixed URL either way, but only by
 * bouncing the browser through a redirect. Building the right one here spares
 * every link and every Server Action that round trip.
 */
export async function teamBase() {
  return isAppHost((await headers()).get("host")) ? "" : TEAM_SECTION;
}

/** `redirect()` to a path inside the team app, written without the prefix. */
export async function teamRedirect(path: string): Promise<never> {
  redirect(teamPath(await teamBase(), path));
}
