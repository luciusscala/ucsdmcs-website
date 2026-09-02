/**
 * Club-wide constants. Edit these once and the whole site follows.
 */
export const site = {
  name: "UC San Diego Men's Club Soccer",
  shortName: "UCSD Men's Club Soccer",
  season: "2026–27",
  league: "US College Club Soccer — SoCal Conference",
  homeVenue: "RIMAC Field, La Jolla, CA",
  /** University mailing address. */
  address: {
    org: "University of California San Diego",
    street: "9500 Gilman Drive",
    city: "La Jolla, CA 92093",
  },
  email: "mensclubsoccer@ucsd.edu",
  instagram: "https://instagram.com/ucsdmensclubsoccer",
  /** Used for search results and link previews only. */
  description:
    "Fixtures, results, standings and roster for the UC San Diego men's club soccer team.",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/roster", label: "Roster" },
  { href: "/stats", label: "Stats" },
  { href: "/standings", label: "Standings" },
  { href: "/articles", label: "Articles" },
  { href: "/tryouts", label: "Tryouts" },
] as const;

export const logos = {
  trident: "/logos/ucsdtridentlogo.png",
  wordmark: "/logos/ucsd-wordmark.png",
  academic: "/logos/ucsd-academiclogo.png",
  recreation: "/logos/ucsdreclogo.png",
  usccs: "/logos/usccslogo.png",
  nirsa: "/logos/nirsalogo.png",
} as const;

/**
 * Single-color white variants for use on navy, generated from the files above:
 * ink becomes white and light areas become transparent, so knockout lettering
 * (the USCCS crest, the NIRSA banner) shows the navy through rather than
 * flattening into a solid blob.
 */
export const logosWhite = {
  wordmark: "/logos/ucsd-wordmark-white.png",
  recreation: "/logos/ucsdreclogo-white.png",
  usccs: "/logos/usccslogo-white.png",
  nirsa: "/logos/nirsalogo-white.png",
} as const;

/**
 * Banner photography. `focus` is the object-position used when the image is
 * cropped into a wide band — tweak it if a crop cuts someone off.
 */
export const media = {
  action: {
    src: "/images/cole.jpeg",
    width: 800,
    height: 531,
    alt: "A UC San Diego player drives forward with the ball on a wet grass field",
    focus: "center",
  },
  night: {
    src: "/images/jake.jpeg",
    width: 800,
    height: 533,
    alt: "A UC San Diego player carries the ball between two defenders under floodlights",
    focus: "center",
  },
  breakaway: {
    src: "/images/lucasv2.jpeg",
    width: 800,
    height: 533,
    alt: "A UC San Diego player breaks away from a Cal Poly defender",
    focus: "center",
  },
  celebration: {
    src: "/images/celebration.jpeg",
    width: 800,
    height: 533,
    alt: "The squad mobs a teammate after a goal in the away kit",
    focus: "center",
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
