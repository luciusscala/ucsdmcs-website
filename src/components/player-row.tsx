import Image from "next/image";

import type { Player } from "@/lib/data/roster";
import { initialsOf } from "@/lib/text";

export function PlayerRow({ player }: { player: Player }) {
  return (
    <li className="flex items-center gap-4 border-b border-white/10 py-3">
      <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-yellow">
        {player.number ?? "—"}
      </span>

      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
        {player.headshot ? (
          <Image
            src={player.headshot}
            alt=""
            fill
            sizes="44px"
            className="object-cover object-top"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-xs font-semibold text-white/60">
            {initialsOf(player.name)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="headline truncate text-base text-white">{player.name}</p>
        <p className="mt-0.5 truncate text-xs text-white/50 sm:hidden">
          {player.position}
          {player.hometown && ` · ${player.hometown}`}
        </p>
      </div>

      <span className="hidden w-28 shrink-0 text-sm text-white/70 sm:block">
        {player.position}
      </span>
      <span className="hidden w-20 shrink-0 text-sm text-white/50 md:block">
        {player.year}
      </span>
      <span className="hidden w-48 shrink-0 truncate text-sm text-white/50 lg:block">
        {player.hometown}
      </span>
    </li>
  );
}
