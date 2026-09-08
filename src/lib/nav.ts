/** The UC San Diego giving page, with the club's campaign link id. */
const DONATE_URL =
  "https://giveto.ucsd.edu/giving/home/?linkId=9081fab7-c984-45ef-ba36-026e10f28f95";

/**
 * The site's primary links, shared by the header and its mobile menu so the
 * two can't drift. `external` marks a link that leaves the site: those render
 * as a plain anchor rather than a `Link`, which also keeps typed routes happy.
 */
export const NAV = [
  { href: "/schedule", label: "Schedule & Scores", external: false },
  { href: "/standings", label: "Standings", external: false },
  { href: "/roster", label: "Roster", external: false },
  { href: "/tryouts", label: "Tryouts", external: false },
  { href: DONATE_URL, label: "Donate", external: true },
] as const;

/**
 * The club's public accounts, linked from the footer and named on the
 * homepage. `handle` is what the club prints; `href` is that handle on the
 * platform's canonical profile path.
 */
export const SOCIAL = [
  {
    href: "https://www.instagram.com/ucsdclubsoccer",
    label: "Instagram",
    handle: "@ucsdclubsoccer",
  },
  {
    href: "https://www.facebook.com/ucsdsoccerclub",
    label: "Facebook",
    handle: "@ucsdsoccerclub",
  },
] as const;

/**
 * Whether a nav link points at the page currently being viewed, so the header
 * can mark it. A section owns its subpaths — `/schedule/calendar` still lights
 * up Schedule — while "/" has to match exactly or it would own everything.
 */
export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
