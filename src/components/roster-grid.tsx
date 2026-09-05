"use client";

import { useMemo, useState } from "react";

import { PlayerCard } from "@/components/player-card";
import { type Player, positionsIn } from "@/lib/data/roster";

const ALL = "All";

export function RosterGrid({ players }: { players: Player[] }) {
  const [active, setActive] = useState(ALL);

  const tabs = useMemo(() => {
    const counts = new Map<string, number>([[ALL, players.length]]);
    for (const player of players) {
      counts.set(player.position, (counts.get(player.position) ?? 0) + 1);
    }
    return [ALL, ...positionsIn(players)].map((label) => ({
      label,
      count: counts.get(label) ?? 0,
    }));
  }, [players]);

  const filtered =
    active === ALL
      ? players
      : players.filter((player) => player.position === active);

  return (
    <>
      <div className="flex gap-1 overflow-x-auto border-b border-white/15">
        {tabs.map((tab) => {
          const selected = tab.label === active;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(tab.label)}
              aria-pressed={selected}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                selected
                  ? "border-yellow text-yellow"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-xs tabular-nums ${
                  selected ? "text-yellow/70" : "text-white/35"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </ul>
    </>
  );
}
