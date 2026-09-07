"use client";

import { useMemo, useState } from "react";

import {
  type Player,
  abbreviateClass,
  abbreviatePosition,
  classRank,
  compareNumbers,
  positionRank,
} from "@/lib/data/roster";

type SortKey = "number" | "name" | "position" | "year";
type Direction = "asc" | "desc";

/**
 * Hometown leaves the table below `sm` and reappears under the player's name,
 * so a phone shows every field without a sideways scroll. The identifying
 * columns keep narrower widths there too.
 */
const COLUMNS: { key: SortKey | null; label: string; className: string }[] = [
  { key: "number", label: "#", className: "w-10 sm:w-16" },
  { key: "name", label: "Name", className: "" },
  { key: "position", label: "Pos", className: "w-14 sm:w-20" },
  { key: "year", label: "Class", className: "w-16 sm:w-24" },
  { key: null, label: "Hometown", className: "hidden sm:table-cell" },
];

export function RosterTable({ players }: { players: Player[] }) {
  const [key, setKey] = useState<SortKey>("number");
  const [direction, setDirection] = useState<Direction>("asc");

  /** Same column flips direction; a new column starts ascending. */
  const sortBy = (next: SortKey) => {
    if (next === key) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setKey(next);
      setDirection("asc");
    }
  };

  const sorted = useMemo(() => {
    const factor = direction === "asc" ? 1 : -1;

    const compare = (a: Player, b: Player) => {
      switch (key) {
        case "number":
          return compareNumbers(a.number, b.number, factor);
        case "name":
          return a.name.localeCompare(b.name) * factor;
        case "position":
          return (positionRank(a.position) - positionRank(b.position)) * factor;
        case "year":
          return (classRank(a.year) - classRank(b.year)) * factor;
      }
    };

    // Name breaks ties, and stays ascending so equal rows keep a stable order.
    return [...players].sort(
      (a, b) => compare(a, b) || a.name.localeCompare(b.name),
    );
  }, [players, key, direction]);

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm sm:min-w-[34rem]">
        <thead>
          <tr className="bg-navy">
            {COLUMNS.map((column) => {
              const selected = column.key !== null && column.key === key;

              return (
                <th
                  key={column.label}
                  scope="col"
                  aria-sort={
                    selected
                      ? direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={`text-left text-xs font-semibold uppercase tracking-wider text-yellow ${column.className}`}
                >
                  {column.key === null ? (
                    <span className="block px-2 py-2 sm:px-3">{column.label}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sortBy(column.key as SortKey)}
                      className="flex w-full items-center gap-1 px-2 py-2 text-left uppercase transition hover:text-white sm:px-3"
                    >
                      {column.label}
                      <span aria-hidden className="text-[0.65rem] leading-none">
                        {selected ? (direction === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((player) => (
            <tr key={player.id} className="border-b border-border even:bg-surface">
              <td className="px-2 py-2 tabular-nums text-muted sm:px-3 sm:py-2.5">
                {player.number ?? "—"}
              </td>
              <td className="px-2 py-2 font-semibold sm:px-3 sm:py-2.5">
                {player.name}
                {player.hometown && (
                  <span className="block text-xs font-normal text-muted sm:hidden">
                    {player.hometown}
                  </span>
                )}
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                {abbreviatePosition(player.position)}
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                {abbreviateClass(player.year)}
              </td>
              <td className="hidden px-2 py-2 text-muted sm:table-cell sm:px-3 sm:py-2.5">
                {player.hometown ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
