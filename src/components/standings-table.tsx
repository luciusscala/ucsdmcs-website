import Image from "next/image";

import { type TeamRecord, formatDifference } from "@/lib/data/standings";
import { initialsOf } from "@/lib/text";

/**
 * The stat columns, in the order a league table is normally read. Header label
 * and cell value come from the same entry so the two can't drift apart.
 *
 * Goals for and against leave the table below `sm`, where ten columns won't fit
 * a phone without a sideways scroll; goal difference stays, since it carries
 * the same information in one column. Yellow and red cards are in the payload
 * but aren't shown — they decide only the fifth tiebreaker.
 */
const COLUMNS: {
  label: string;
  name: string;
  value: (record: TeamRecord) => string | number;
  className?: string;
  strong?: boolean;
}[] = [
  { label: "GP", name: "Games played", value: (r) => r.played },
  { label: "W", name: "Wins", value: (r) => r.won },
  { label: "D", name: "Draws", value: (r) => r.drawn },
  { label: "L", name: "Losses", value: (r) => r.lost },
  {
    label: "GF",
    name: "Goals for",
    value: (r) => r.goalsFor,
    className: "hidden sm:table-cell",
  },
  {
    label: "GA",
    name: "Goals against",
    value: (r) => r.goalsAgainst,
    className: "hidden sm:table-cell",
  },
  {
    label: "GD",
    name: "Goal difference",
    value: (r) => formatDifference(r.goalDifference),
  },
  { label: "PTS", name: "Points", value: (r) => r.points, strong: true },
];

export function StandingsTable({ records }: { records: TeamRecord[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-navy">
            <th
              scope="col"
              className="w-8 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-yellow sm:w-10 sm:px-3"
            >
              <span className="sr-only">Position</span>
              <span aria-hidden>#</span>
            </th>

            <th
              scope="col"
              className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-yellow sm:px-3"
            >
              Team
            </th>

            {COLUMNS.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`w-10 px-1.5 py-2 text-center text-xs font-semibold uppercase tracking-wider text-yellow sm:w-14 sm:px-2 ${column.className ?? ""}`}
              >
                {/* The full name for anyone who needs it, without spending a
                    column on it. `no-underline` drops the browser's dotted rule,
                    which reads as an error against the navy. */}
                <abbr title={column.name} className="no-underline">
                  {column.label}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {records.map((record, index) => (
            <tr
              key={record.id}
              /* Our own row is tinted rather than striped, so it's findable at
                 a glance without leaving the two-colour palette. */
              className={
                record.isUs
                  ? "border-b border-border bg-yellow/25"
                  : "border-b border-border even:bg-surface"
              }
            >
              <td className="px-2 py-2 text-center tabular-nums text-muted sm:px-3 sm:py-2.5">
                {index + 1}
              </td>

              <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Fixed box whether or not a crest exists, so names stay on
                      one edge, as on the schedule. */}
                  <span className="flex size-7 shrink-0 items-center justify-center">
                    {record.logo ? (
                      <Image
                        src={record.logo}
                        // Decorative: the school name sits immediately beside it.
                        alt=""
                        width={28}
                        height={28}
                        className="size-7 object-contain"
                      />
                    ) : (
                      /* A school with no crest gets a monogram, never a gap. */
                      <span className="flex size-6 items-center justify-center border border-border-strong text-[0.6rem] font-semibold text-muted">
                        {initialsOf(record.name)}
                      </span>
                    )}
                  </span>

                  <span className="font-semibold">{record.name}</span>
                </div>
              </td>

              {COLUMNS.map((column) => (
                <td
                  key={column.label}
                  className={`px-1.5 py-2 text-center tabular-nums sm:px-2 sm:py-2.5 ${
                    column.strong ? "font-semibold" : ""
                  } ${column.className ?? ""}`}
                >
                  {column.value(record)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
