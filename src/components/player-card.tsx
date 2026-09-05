import Image from "next/image";

import { type Player, initialsOf } from "@/lib/data/roster";

export function PlayerCard({ player }: { player: Player }) {
  const watermark = player.number ?? initialsOf(player.name);

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue/40 to-navy" />
      )}

      {/* Scrim first, so it darkens the photo but not the type above it. */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" />

      {/* Squad number watermarked behind the name, as on the reference. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-14 text-center font-bold leading-none tabular-nums text-white/15 text-6xl"
      >
        {watermark}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-3 text-center">
        <p className="headline truncate text-lg text-white">{player.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-white">
          {player.position}
        </p>
        <p className="mt-0.5 truncate text-xs text-white/55">
          {player.year}
          {player.hometown && ` · ${player.hometown}`}
        </p>
      </div>
    </li>
  );
}
