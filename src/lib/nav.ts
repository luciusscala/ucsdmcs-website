/** The UC San Diego giving page, with the club's campaign link id. */
const DONATE_URL =
  "https://giveto.ucsd.edu/giving/home/?linkId=9081fab7-c984-45ef-ba36-026e10f28f95";

/**
 * The site's primary links, shared by the header and footer so the two can't
 * drift. `external` marks a link that leaves the site: those render as a plain
 * anchor rather than a `Link`, which also keeps typed routes happy.
 */
export const NAV = [
  { href: "/schedule", label: "Schedule & Scores", external: false },
  { href: "/standings", label: "Standings", external: false },
  { href: "/roster", label: "Roster", external: false },
  { href: "/tryouts", label: "Tryouts", external: false },
  { href: DONATE_URL, label: "Donate", external: true },
] as const;
