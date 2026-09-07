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

const COLUMNS: { key: SortKey | null; label: string; className: string }[] = [
  { key: "number", label: "#", className: "w-16" },
  { key: "name", label: "Full name", className: "" },
  { key: "position", label: "Pos", className: "w-20" },
  { key: "year", label: "Class", className: "w-24" },
  { key: null, label: "Hometown", className: "" },
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
      <table className="w-full min-w-[34rem] border-collapse text-sm">
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
                    <span className="block px-3 py-2">{column.label}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sortBy(column.key as SortKey)}
                      className="flex w-full items-center gap-1 px-3 py-2 text-left uppercase transition hover:text-white"
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
              <td className="px-3 py-2.5 tabular-nums text-muted">
                {player.number ?? "—"}
              </td>
              <td className="px-3 py-2.5 font-semibold">{player.name}</td>
              <td className="px-3 py-2.5">
                {abbreviatePosition(player.position)}
              </td>
              <td className="px-3 py-2.5">{abbreviateClass(player.year)}</td>
              <td className="px-3 py-2.5 text-muted">
                {player.hometown ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
