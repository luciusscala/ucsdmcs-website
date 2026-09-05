import Image from "next/image";

import type { Player } from "@/lib/data/roster";
import { initialsOf } from "@/lib/text";

export function PlayerRow({ player }: { player: Player }) {
  return (
    <li className="flex items-center gap-4 border border-border bg-surface px-4 py-3">
      {/* Same navy chip as the schedule's vs badge, so numbers read as one
          badge language across both pages. */}
      <span className="w-9 shrink-0 bg-navy px-1.5 py-0.5 text-center text-xs font-bold tabular-nums text-yellow">
        {player.number ?? "—"}
      </span>

      <div className="relative size-11 shrink-0 overflow-hidden bg-border">
        {player.headshot ? (
          <Image
            src={player.headshot}
            alt=""
            fill
            sizes="44px"
            className="object-cover object-top"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-xs font-semibold text-muted">
            {initialsOf(player.name)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="headline truncate text-base">{player.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted sm:hidden">
          {player.position}
          {player.hometown && ` · ${player.hometown}`}
        </p>
      </div>

      <span className="hidden w-28 shrink-0 text-sm text-foreground sm:block">
        {player.position}
      </span>
      <span className="hidden w-20 shrink-0 text-sm text-muted md:block">
        {player.year}
      </span>
      <span className="hidden w-48 shrink-0 truncate text-sm text-muted lg:block">
        {player.hometown}
      </span>
    </li>
  );
}
