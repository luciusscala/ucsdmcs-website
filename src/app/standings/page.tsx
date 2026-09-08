import type { Metadata } from "next";

import { StandingsTable } from "@/components/standings-table";
import {
  DIVISION,
  MICROSITE_URL,
  SEASON_YEAR,
  type TeamRecord,
  getStandings,
} from "@/lib/data/standings";

export const metadata: Metadata = {
  title: "Standings",
  description: `The ${SEASON_YEAR} ${DIVISION} division table for College Club Soccer — Men.`,
};

/**
 * Once a day, matching the fetch in `@/lib/data/standings` so the league table
 * and the crests joined onto it refresh together. Next requires a literal here,
 * which is why this can't reference REVALIDATE_SECONDS.
 */
export const revalidate = 86400;

export default async function StandingsPage() {
  // As on the schedule and roster, an upstream outage degrades to an error
  // state rather than failing the build. "Unavailable" stays distinct from
  // "no standings posted".
  let records: TeamRecord[] = [];
  let failed = false;

  try {
    records = await getStandings();
  } catch (error) {
    console.error(error);
    failed = true;
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <h1 className="headline text-xl sm:text-2xl">
          {SEASON_YEAR} {DIVISION} Division Standings
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 bg-surface px-4 py-3">
          <span className="text-sm text-muted">
            {records.length} {records.length === 1 ? "team" : "teams"}
          </span>

          <span className="text-sm text-muted">
            3 points for a win, 1 for a draw
          </span>

          <a
            href={MICROSITE_URL}
            // The league's table is the source of record; keep ours open behind it.
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue underline underline-offset-4 transition hover:opacity-70"
          >
            League standings
          </a>
        </div>

        {failed ? (
          <p className="py-10 text-muted">
            The standings are unavailable right now. Please check back shortly.
          </p>
        ) : records.length === 0 ? (
          <p className="py-10 text-muted">No standings posted yet.</p>
        ) : (
          <StandingsTable records={records} />
        )}
      </div>
    </div>
  );
}
