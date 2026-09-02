"use client";

import { useState } from "react";
import { PlayerCard } from "@/components/player-card";
import {
  type Player,
  type Position,
  positionLabels,
  positionOrder,
} from "@/lib/data/roster";

type Filter = Position | "ALL";

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  ...positionOrder.map((p) => ({ value: p as Filter, label: positionLabels[p] })),
];

export function RosterFilter({ players }: { players: Player[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const shown =
    filter === "ALL" ? players : players.filter((p) => p.position === filter);

  const sorted = [...shown].sort(
    (a, b) =>
      positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position) ||
      a.number - b.number,
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`eyebrow rounded-full border px-5 py-2.5 text-[0.6875rem] transition-colors ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-border text-muted hover:border-navy hover:text-navy"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((player) => (
          <PlayerCard key={player.number} player={player} />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="py-16 text-center text-muted">
          No players listed for this position yet.
        </p>
      )}
    </>
  );
}
