import Image from "next/image";

import { type Player, initialsOf } from "@/lib/data/roster";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <li>
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-surface">
        {player.headshot ? (
          <Image
            src={player.headshot}
            alt={player.name}
            fill
            // Two across on phones, three on tablets, four on desktop.
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="headline text-3xl text-border-strong">
              {initialsOf(player.name)}
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 flex items-baseline gap-2">
        {player.number !== null && (
          <span className="shrink-0 text-sm tabular-nums text-muted">
            {player.number}
          </span>
        )}
        <span className="headline text-lg">{player.name}</span>
      </p>

      <p className="mt-0.5 text-sm text-muted">
        {player.year}
        {player.hometown && ` · ${player.hometown}`}
      </p>
    </li>
  );
}
