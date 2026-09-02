export type MatchStatus = "upcoming" | "final";
export type MatchOutcome = "W" | "L" | "D";

export type Match = {
  id: string;
  /** ISO 8601, e.g. "2026-09-19T19:00:00-07:00" */
  date: string;
  opponent: string;
  home: boolean;
  competition: string;
  venue: string;
  status: MatchStatus;
  /** Only for status: "final" */
  score?: { us: number; them: number };
  note?: string;
};

/** TODO: replace with the real 2026–27 fixture list. */
export const matches: Match[] = [
  {
    id: "m1",
    date: "2026-09-12T11:00:00-07:00",
    opponent: "UC Irvine",
    home: true,
    competition: "SoCal Conference",
    venue: "RIMAC Field",
    status: "final",
    score: { us: 3, them: 1 },
  },
  {
    id: "m2",
    date: "2026-09-19T14:00:00-07:00",
    opponent: "Cal Poly SLO",
    home: false,
    competition: "SoCal Conference",
    venue: "Sports Complex, San Luis Obispo",
    status: "final",
    score: { us: 2, them: 2 },
  },
  {
    id: "m3",
    date: "2026-09-26T11:00:00-07:00",
    opponent: "San Diego State",
    home: true,
    competition: "SoCal Conference",
    venue: "RIMAC Field",
    status: "final",
    score: { us: 1, them: 0 },
    note: "Crosstown rivalry",
  },
  {
    id: "m4",
    date: "2026-10-03T13:00:00-07:00",
    opponent: "UC Santa Barbara",
    home: false,
    competition: "SoCal Conference",
    venue: "Storke Field, Santa Barbara",
    status: "final",
    score: { us: 0, them: 2 },
  },
  {
    id: "m5",
    date: "2026-10-10T11:00:00-07:00",
    opponent: "UCLA",
    home: true,
    competition: "SoCal Conference",
    venue: "RIMAC Field",
    status: "upcoming",
  },
  {
    id: "m6",
    date: "2026-10-17T12:00:00-07:00",
    opponent: "USC",
    home: false,
    competition: "SoCal Conference",
    venue: "Cromwell Field, Los Angeles",
    status: "upcoming",
  },
  {
    id: "m7",
    date: "2026-10-24T11:00:00-07:00",
    opponent: "Cal State Long Beach",
    home: true,
    competition: "SoCal Conference",
    venue: "RIMAC Field",
    status: "upcoming",
  },
  {
    id: "m8",
    date: "2026-11-07T10:00:00-08:00",
    opponent: "TBD",
    home: false,
    competition: "USCCS Regionals",
    venue: "TBD",
    status: "upcoming",
  },
];

export const outcomeOf = (m: Match): MatchOutcome | null => {
  if (m.status !== "final" || !m.score) return null;
  if (m.score.us > m.score.them) return "W";
  if (m.score.us < m.score.them) return "L";
  return "D";
};

const byDateAsc = (a: Match, b: Match) => +new Date(a.date) - +new Date(b.date);

export const upcomingMatches = () =>
  matches.filter((m) => m.status === "upcoming").sort(byDateAsc);

export const finalMatches = () =>
  matches.filter((m) => m.status === "final").sort((a, b) => byDateAsc(b, a));

export const nextMatch = () => upcomingMatches()[0] ?? null;

export const seasonRecord = () => {
  const played = finalMatches();
  const record = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  for (const m of played) {
    if (!m.score) continue;
    record.gf += m.score.us;
    record.ga += m.score.them;
    const o = outcomeOf(m);
    if (o === "W") record.w += 1;
    else if (o === "D") record.d += 1;
    else if (o === "L") record.l += 1;
  }
  return record;
};
