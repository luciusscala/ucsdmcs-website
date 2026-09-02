import type { Metadata } from "next";
import { HeroStats, PageHero } from "@/components/page-hero";
import {
  OUR_TEAM,
  goalDiff,
  points,
  sortedStandings,
} from "@/lib/data/standings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Standings",
  description: `${site.league} table for the ${site.season} season.`,
};

const columns = [
  { key: "played", label: "GP", title: "Games played" },
  { key: "won", label: "W", title: "Wins" },
  { key: "drawn", label: "D", title: "Draws" },
  { key: "lost", label: "L", title: "Losses" },
  { key: "goalsFor", label: "GF", title: "Goals for" },
  { key: "goalsAgainst", label: "GA", title: "Goals against" },
] as const;

export default function StandingsPage() {
  const table = sortedStandings();
  const ourIndex = table.findIndex((r) => r.team === OUR_TEAM);
  const ours = ourIndex >= 0 ? table[ourIndex] : null;

  return (
    <>
      <PageHero
        eyebrow={site.league}
        title="Standings"
        description={`${site.season} conference table. Three points for a win, one for a draw; ties broken by goal difference, then goals scored.`}
        aside={
          ours ? (
            <HeroStats
              stats={[
                { label: "Position", value: `${ourIndex + 1} of ${table.length}` },
                { label: "Points", value: String(points(ours)) },
                { label: "Played", value: String(ours.played) },
              ]}
            />
          ) : undefined
        }
      />

      <section className="container-page py-14">
        <div className="mx-auto max-w-4xl overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="eyebrow w-12 px-3 py-3.5 text-left text-[0.6875rem] font-normal">
                  Pos
                </th>
                <th className="eyebrow px-3 py-3.5 text-left text-[0.6875rem] font-normal">
                  Club
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    title={col.title}
                    className="eyebrow w-14 px-3 py-3.5 text-right text-[0.6875rem] font-normal"
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  title="Goal difference"
                  className="eyebrow w-14 px-3 py-3.5 text-right text-[0.6875rem] font-normal"
                >
                  GD
                </th>
                <th
                  title="Points"
                  className="eyebrow w-16 px-3 py-3.5 text-right text-[0.6875rem] text-yellow"
                >
                  Pts
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, index) => {
                const ours = row.team === OUR_TEAM;
                const gd = goalDiff(row);
                return (
                  <tr
                    key={row.team}
                    className={
                      ours
                        ? "bg-navy text-white"
                        : index % 2 === 1
                          ? "bg-surface"
                          : "bg-background"
                    }
                  >
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded font-bold ${
                          ours ? "bg-yellow text-navy" : "text-muted"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td
                      className={`headline px-3 py-4 text-lg ${
                        ours ? "text-white" : "text-navy"
                      }`}
                    >
                      {row.team}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-4 text-right tabular-nums"
                      >
                        {row[col.key]}
                      </td>
                    ))}
                    <td className="px-3 py-4 text-right tabular-nums">
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td
                      className={`px-3 py-4 text-right text-base font-bold tabular-nums ${
                        ours ? "text-yellow" : "text-navy"
                      }`}
                    >
                      {points(row)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <dl className="mx-auto mt-6 flex max-w-4xl flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          {[
            ["GP", "Games played"],
            ["W / D / L", "Wins, draws, losses"],
            ["GF / GA", "Goals for and against"],
            ["GD", "Goal difference"],
            ["Pts", "Points"],
          ].map(([abbr, meaning]) => (
            <div key={abbr} className="flex gap-2">
              <dt className="font-semibold text-navy">{abbr}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
