/**
 * Player stat lines, keyed by jersey number so they stay joined to roster.ts.
 * Team totals are derived from schedule.ts and never entered by hand.
 */
import { type Player, roster } from "@/lib/data/roster";
import { type Match, finalMatches, outcomeOf } from "@/lib/data/schedule";

export type PlayerStat = {
  /** Matches roster.ts `number`. */
  number: number;
  appearances: number;
  goals: number;
  assists: number;
  /** Goalkeepers only. */
  cleanSheets?: number;
};

/** TODO: replace with the real stat lines. */
export const playerStats: PlayerStat[] = [
  { number: 1, appearances: 4, goals: 0, assists: 0, cleanSheets: 2 },
  { number: 12, appearances: 1, goals: 0, assists: 0, cleanSheets: 0 },
  { number: 2, appearances: 4, goals: 1, assists: 0 },
  { number: 3, appearances: 3, goals: 0, assists: 1 },
  { number: 4, appearances: 4, goals: 0, assists: 0 },
  { number: 5, appearances: 4, goals: 1, assists: 0 },
  { number: 15, appearances: 2, goals: 0, assists: 0 },
  { number: 6, appearances: 4, goals: 0, assists: 2 },
  { number: 8, appearances: 4, goals: 1, assists: 1 },
  { number: 10, appearances: 4, goals: 1, assists: 2 },
  { number: 14, appearances: 3, goals: 0, assists: 0 },
  { number: 16, appearances: 2, goals: 0, assists: 1 },
  { number: 7, appearances: 4, goals: 1, assists: 0 },
  { number: 9, appearances: 4, goals: 2, assists: 0 },
  { number: 11, appearances: 3, goals: 1, assists: 1 },
  { number: 17, appearances: 2, goals: 0, assists: 0 },
];

/** A stat line joined to the player it belongs to. */
export type StatLine = PlayerStat & { player: Player };

export const statLines = (): StatLine[] =>
  playerStats.flatMap((stat) => {
    const player = roster.find((p) => p.number === stat.number);
    return player ? [{ ...stat, player }] : [];
  });

/** Top `count` players by `key`, dropping anyone on zero. */
export const leaders = (key: "goals" | "assists" | "appearances", count = 5) =>
  statLines()
    .filter((line) => line[key] > 0)
    .sort(
      (a, b) =>
        b[key] - a[key] ||
        b.goals - a.goals ||
        a.player.name.localeCompare(b.player.name),
    )
    .slice(0, count);

export const keepers = () =>
  statLines()
    .filter((line) => line.cleanSheets !== undefined)
    .sort((a, b) => (b.cleanSheets ?? 0) - (a.cleanSheets ?? 0));

/** Team totals, all derived from played matches. */
export const teamStats = () => {
  const played = finalMatches();
  let w = 0;
  let d = 0;
  let l = 0;
  let gf = 0;
  let ga = 0;
  let cleanSheets = 0;

  for (const match of played) {
    if (!match.score) continue;
    gf += match.score.us;
    ga += match.score.them;
    if (match.score.them === 0) cleanSheets += 1;
    const outcome = outcomeOf(match);
    if (outcome === "W") w += 1;
    else if (outcome === "D") d += 1;
    else if (outcome === "L") l += 1;
  }

  const games = played.length;
  return {
    games,
    w,
    d,
    l,
    gf,
    ga,
    cleanSheets,
    goalDiff: gf - ga,
    goalsPerGame: games ? gf / games : 0,
    concededPerGame: games ? ga / games : 0,
    winRate: games ? w / games : 0,
  };
};

/** Most recent results first, newest at the left of the form guide. */
export const form = (count = 5): Match[] => finalMatches().slice(0, count);
