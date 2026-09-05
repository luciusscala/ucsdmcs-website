"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { PlayerCard } from "@/components/player-card";
import { PlayerRow } from "@/components/player-row";
import { type Player, positionsIn } from "@/lib/data/roster";

const ALL = "All";
const VIEW_KEY = "roster-view";

type View = "list" | "cards";

/**
 * The view preference lives in localStorage, so it is an external store rather
 * than React state. `useSyncExternalStore` reads it without a hydration
 * mismatch: the server snapshot is always "list", and React swaps in the
 * stored value on the client.
 */
const listeners = new Set<() => void>();

function readView(): View {
  try {
    return window.localStorage.getItem(VIEW_KEY) === "cards" ? "cards" : "list";
  } catch {
    // Private browsing or blocked storage — the default stands.
    return "list";
  }
}

function subscribeToView(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function writeView(next: View) {
  try {
    window.localStorage.setItem(VIEW_KEY, next);
  } catch {
    // The preference just won't persist.
  }
  for (const listener of listeners) listener();
}

export function RosterGrid({ players }: { players: Player[] }) {
  const [active, setActive] = useState(ALL);
  const view = useSyncExternalStore(subscribeToView, readView, () => "list");

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
      <div className="mt-4 flex items-end gap-4 border-b border-border">
        <div className="flex flex-1 gap-1 overflow-x-auto">
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
                    ? "border-blue text-blue"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 text-xs tabular-nums ${
                    selected ? "text-blue/70" : "text-muted/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 gap-1 pb-2">
          {(["list", "cards"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => writeView(option)}
              aria-pressed={view === option}
              className={`px-2.5 py-1 text-xs font-medium capitalize transition ${
                view === option
                  ? "bg-navy text-yellow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {view === "cards" ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </ul>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtered.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </ul>
      )}
    </>
  );
}
