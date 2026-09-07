import Image from "next/image";

import { MatchLocation } from "@/components/match-location";
import { type Game, hasResult, outcome } from "@/lib/data/schedule";
import { formatGameDate, formatTime } from "@/lib/format";
import { initialsOf } from "@/lib/text";

export function MatchRow({ game }: { game: Game }) {
  const result = outcome(game);
  const played = hasResult(game);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-border bg-surface px-4 py-4">
      {/* Fixed box whether or not a crest exists, so names stay on one edge. */}
      <div className="flex size-12 shrink-0 items-center justify-center">
        {game.opponentLogo ? (
          <Image
            src={game.opponentLogo}
            // Decorative: the school name sits immediately beside it.
            alt=""
            width={48}
            height={48}
            className="size-12 object-contain"
          />
        ) : (
          /* A school with no crest gets a monogram, never an empty gap. */
          <span className="flex size-10 items-center justify-center border border-border-strong text-xs font-semibold text-muted">
            {initialsOf(game.opponent)}
          </span>
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
          <span className="shrink-0 bg-navy px-1.5 py-0.5 text-xs font-bold uppercase text-yellow">
            {game.isHome ? "vs" : "at"}
          </span>
          <span className="headline truncate text-lg sm:text-xl">
            {game.opponent}
          </span>
        </p>
      </div>

      {/* Wraps to its own line under the name on mobile, own column from md up. */}
      <MatchLocation
        game={game}
        className="order-last w-full truncate pl-16 text-sm text-muted md:order-none md:w-56 md:shrink-0 md:pl-0 lg:w-72"
      />

      {/* Never blank: a played game shows its score, an upcoming one says so,
          so "not played yet" can't be mistaken for missing data. */}
      <span className="shrink-0 text-sm">
        {played && result ? (
          <span className="headline text-base tabular-nums sm:text-lg">
            {result}, {game.ourScore}&ndash;{game.theirScore}
          </span>
        ) : (
          <span className="text-muted">Upcoming</span>
        )}
      </span>
    </li>
  );
}
