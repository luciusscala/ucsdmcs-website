/**
 * The team app is a section of this site, `src/app/team`, and also a site of
 * its own at app.ucsdmcs.com. One deployment serves both: middleware looks at
 * the request's host and, on the app host, serves the section from the root,
 * so a player's URL bar reads app.ucsdmcs.com/settings rather than
 * ucsdmcs.com/team/settings.
 *
 * This module is the one place that knows which host is which. It is imported
 * by middleware (Edge) as well as by Server Components, so it stays pure.
 */

/** Where the team app lives inside the App Router. */
export const TEAM_SECTION = "/team";

/**
 * The app's hostname in production, e.g. `app.ucsdmcs.com`. Optional: any
 * `app.` host is recognised without it, which covers app.localhost:3000. It
 * is only *required* to send ucsdmcs.com/team traffic to the subdomain, since
 * nothing else can tell "ucsdmcs.com" from a Vercel preview URL.
 */
export const APP_HOST = hostname(process.env.APP_HOST);

/** A Host header without its port, lowercased; "" when there isn't one. */
function hostname(host: string | null | undefined) {
  return (host ?? "").toLowerCase().split(":")[0];
}

/** Whether this request arrived on the team app's own hostname. */
export function isAppHost(host: string | null | undefined) {
  const name = hostname(host);
  if (!name) return false;
  return name.startsWith("app.") || (APP_HOST !== "" && name === APP_HOST);
}

/** A path inside the team section, as this host spells it. */
export function teamPath(base: string, path: string) {
  return `${base}${path}` || "/";
}
