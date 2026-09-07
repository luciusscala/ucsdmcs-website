import { type Game, directionsUrl } from "@/lib/data/schedule";

/**
 * The venue, followed by a Directions link when the game carries an address.
 * Renders nothing when it has neither, so callers need no guard of their own.
 *
 * The location stays plain text — only the address can be routed to, and the
 * two are separate so a long venue name can truncate without taking the link
 * with it.
 */
export function MatchLocation({
  game,
  className,
}: {
  game: Game;
  className?: string;
}) {
  const href = directionsUrl(game);
  if (!game.location && !href) return null;

  return (
    <p className={`flex items-baseline gap-2 ${className ?? ""}`}>
      {game.location && <span className="truncate">{game.location}</span>}

      {href && (
        <a
          href={href}
          // A map leaves the site entirely; keep the schedule open behind it.
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-medium text-blue underline underline-offset-4 transition hover:opacity-70"
        >
          Directions
        </a>
      )}
    </p>
  );
}
