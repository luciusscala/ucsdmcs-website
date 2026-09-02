/**
 * Club-wide constants. Edit these once and the whole site follows.
 */
export const site = {
  name: "UC San Diego Men's Club Soccer",
  shortName: "UCSD Men's Club Soccer",
  season: "2026–27",
  league: "US College Club Soccer — SoCal Conference",
  homeVenue: "RIMAC Field, La Jolla, CA",
  email: "mensclubsoccer@ucsd.edu",
  instagram: "https://instagram.com/ucsdmensclubsoccer",
  /** Used for search results and link previews only. */
  description:
    "Fixtures, results, standings and roster for the UC San Diego men's club soccer team.",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule & Results" },
  { href: "/roster", label: "Roster" },
  { href: "/standings", label: "Standings" },
] as const;

export const logos = {
  trident: "/logos/ucsdtridentlogo.png",
  wordmark: "/logos/ucsd-wordmark.png",
  academic: "/logos/ucsd-academiclogo.png",
  recreation: "/logos/ucsdreclogo.png",
  usccs: "/logos/usccslogo.png",
  nirsa: "/logos/nirsalogo.png",
  nirsaBlue: "/logos/nirsalogoblue.png",
} as const;

/**
 * Banner photography. `focus` is the object-position used when the image is
 * cropped into a wide band — tweak it if a crop cuts someone off.
 */
export const media = {
  lineups: {
    src: "/images/lineups.jpg",
    width: 1348,
    height: 583,
    alt: "Both teams line up before kickoff",
    focus: "center 40%",
  },
  huddle: {
    src: "/images/huddle.jpg",
    width: 1086,
    height: 724,
    alt: "The squad huddles before a match",
    focus: "center 35%",
  },
  huddleWide: {
    src: "/images/huddle-wide.jpg",
    width: 1086,
    height: 724,
    alt: "Team huddle on the field",
    focus: "center 45%",
  },
  teamPhoto: {
    src: "/images/team-nirsa.jpg",
    width: 1024,
    height: 768,
    alt: "Team photo at the NIRSA Championship Series",
    focus: "center 45%",
  },
} as const;

export type Media = (typeof media)[keyof typeof media];
