import Image from "next/image";
import type { Player } from "@/lib/data/roster";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="flex gap-4 rounded-lg border border-border bg-background p-4 transition-colors hover:border-blue">
      {player.photo ? (
        <Image
          src={player.photo}
          alt={player.name}
          width={160}
          height={160}
          className="h-16 w-16 shrink-0 rounded object-cover object-top"
        />
      ) : (
        <span className="headline flex h-16 w-16 shrink-0 items-center justify-center rounded bg-navy text-2xl text-white">
          {player.number}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="headline truncate text-xl text-navy">
            {player.name}
            {player.captain && (
              <span
                title="Captain"
                className="ml-2 align-middle text-sm text-gold"
              >
                (C)
              </span>
            )}
          </p>
          <span className="eyebrow shrink-0 rounded bg-surface px-2 py-1 text-[0.625rem] text-blue">
            {player.position}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-muted">
          {player.photo ? `#${player.number} · ` : ""}
          {player.year} · {player.hometown}
        </p>
        {player.major && (
          <p className="mt-0.5 truncate text-sm text-muted/75">{player.major}</p>
        )}
      </div>
    </article>
  );
}
