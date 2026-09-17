import { type NextRequest, NextResponse } from "next/server";

import { APP_HOST, TEAM_SECTION, isAppHost } from "@/lib/app-host";

/**
 * The top-level paths the team app answers on its own host, i.e. the children
 * of `src/app/team`. A new route directory there needs a line here; anything
 * not listed belongs to the club site and is sent back to it, which is what
 * the shared header's nav links are.
 */
const APP_PATHS = ["/settings", "/join", "/events", "/new"];

const within = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

/**
 * Host-based routing for the team app, in Next's proxy (formerly middleware)
 * step so it happens before routing. See `src/lib/app-host.ts` for why.
 *
 * On the app host every path is served from `/team`, and a `/team` URL that
 * reaches it anyway — a stale link, a bookmark from before the subdomain —
 * is sent to its canonical, prefix-free form. On the club site the reverse:
 * `/team` belongs to the subdomain, so it moves there.
 *
 * Temporary redirects throughout: a permanent one would be cached in players'
 * browsers long after any change of mind here.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const inSection = within(pathname, TEAM_SECTION);

  if (isAppHost(request.headers.get("host"))) {
    if (inSection) {
      const canonical = request.nextUrl.clone();
      canonical.pathname = pathname.slice(TEAM_SECTION.length) || "/";
      return NextResponse.redirect(canonical, 307);
    }

    if (pathname !== "/" && !APP_PATHS.some((path) => within(pathname, path))) {
      // The club site is this host without its `app.` label, so the two stay
      // paired through localhost, previews and the real domain alike.
      const club = request.nextUrl.clone();
      club.host = club.host.replace(/^app\./i, "");
      return NextResponse.redirect(club, 307);
    }

    const rewritten = request.nextUrl.clone();
    rewritten.pathname = pathname === "/" ? TEAM_SECTION : `${TEAM_SECTION}${pathname}`;
    return NextResponse.rewrite(rewritten);
  }

  // Without APP_HOST there is no subdomain to send them to, so /team keeps
  // working here — which is what localhost and preview deploys want.
  if (inSection && APP_HOST) {
    const moved = request.nextUrl.clone();
    moved.host = APP_HOST;
    moved.port = "";
    moved.protocol = "https";
    moved.pathname = pathname.slice(TEAM_SECTION.length) || "/";
    return NextResponse.redirect(moved, 307);
  }

  return NextResponse.next();
}

export const config = {
  // Everything but Next's own build output and the files in /public, which
  // are the same on both hosts and have no business being rewritten. Those
  // all carry an extension; no page here does.
  matcher: ["/((?!_next/|.*\\.[^/]*$).*)"],
};
