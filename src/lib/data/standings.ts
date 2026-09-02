export type StandingsRow = {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

/** The row that gets highlighted in the table. */
export const OUR_TEAM = "UC San Diego";

/** TODO: replace with the real conference table. Kept in sync with schedule.ts placeholders. */
export const standings: StandingsRow[] = [
  { team: "UCLA", played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 10, goalsAgainst: 3 },
  { team: "UC San Diego", played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 6, goalsAgainst: 5 },
  { team: "USC", played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 6, goalsAgainst: 6 },
  { team: "UC Santa Barbara", played: 4, won: 2, drawn: 0, lost: 2, goalsFor: 6, goalsAgainst: 5 },
  { team: "San Diego State", played: 4, won: 1, drawn: 2, lost: 1, goalsFor: 5, goalsAgainst: 5 },
  { team: "Cal Poly SLO", played: 4, won: 1, drawn: 1, lost: 2, goalsFor: 6, goalsAgainst: 8 },
  { team: "UC Irvine", played: 4, won: 1, drawn: 0, lost: 3, goalsFor: 4, goalsAgainst: 9 },
  { team: "Cal State Long Beach", played: 4, won: 0, drawn: 0, lost: 4, goalsFor: 2, goalsAgainst: 10 },
];

export const points = (r: StandingsRow) => r.won * 3 + r.drawn;
export const goalDiff = (r: StandingsRow) => r.goalsFor - r.goalsAgainst;

export const sortedStandings = () =>
  [...standings].sort(
    (a, b) =>
      points(b) - points(a) ||
      goalDiff(b) - goalDiff(a) ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team),
  );
