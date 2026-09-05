import Image from "next/image";

import { type Game, hasResult, outcome } from "@/lib/data/schedule";
import { formatGameDate, formatTime } from "@/lib/format";

export function MatchRow({ game }: { game: Game }) {
  const result = outcome(game);
  const played = hasResult(game);

  return (
    <li className="-mx-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-3 even:bg-surface">
      {/* Fixed box whether or not a crest exists, so names stay on one edge. */}
      <div className="flex size-12 shrink-0 items-center justify-center">
        {game.opponentLogo && (
          <Image
            src={game.opponentLogo}
            // Decorative: the school name sits immediately beside it.
            alt=""
            width={48}
            height={48}
            className="size-12 object-contain"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{formatGameDate(game.kickoff)}</span>
          {!played && (
            <span className="text-muted"> / {formatTime(game.kickoff)}</span>
          )}
        </p>
        <p className="mt-0.5 flex items-center gap-2">
          <span className="shrink-0 rounded-sm bg-navy px-1.5 py-0.5 text-xs font-bold uppercase text-yellow">
            {game.isHome ? "vs" : "at"}
          </span>
          <span className="headline truncate text-lg sm:text-xl">
            {game.opponent}
          </span>
        </p>
      </div>

      {/* Wraps to its own line under the name on mobile, own column from md up. */}
      {game.location && (
        <p className="order-last w-full truncate pl-16 text-sm text-muted md:order-none md:w-56 md:shrink-0 md:pl-0 lg:w-72">
          {game.location}
        </p>
      )}

      {played && result && (
        <span className="headline shrink-0 text-base tabular-nums sm:text-lg">
          {result}, {game.ourScore}&ndash;{game.theirScore}
        </span>
      )}
    </li>
  );
}
