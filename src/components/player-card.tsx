import Image from "next/image";

import type { Player } from "@/lib/data/roster";
import { initialsOf } from "@/lib/text";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <li className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-navy">
      {player.headshot ? (
        <Image
          src={player.headshot}
          alt={player.name}
          fill
          // Two across on phones up to five on large screens.
          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        /* Flat ground, no gradient: initials sit where a face would be. */
        <div className="absolute inset-x-0 top-0 flex h-2/3 items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-white/25 text-lg font-semibold text-white/70">
            {initialsOf(player.name)}
          </span>
        </div>
      )}

      {/* Scrim first, so it darkens the photo but not the type above it. */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" />

      {player.number !== null && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-6xl font-bold leading-none tabular-nums text-white/15"
        >
          {player.number}
        </span>
      )}

      {/* Photo, name, number, position — nothing else. */}
      <div className="absolute inset-x-0 bottom-0 p-3 text-center">
        <p className="headline truncate text-lg text-white">{player.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-white/80">
          {player.position}
        </p>
      </div>
    </li>
  );
}
