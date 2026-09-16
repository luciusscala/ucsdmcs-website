import { type Game, directionsUrl } from "@/lib/data/schedule";

/**
 * The venue, with a Directions link beneath it when the game carries an
 * address. Renders nothing when it has neither, so callers need no guard of
 * their own.
 *
 * The location stays plain text — only the address can be routed to. The link
 * sits on its own line so every row's link starts at the same edge instead of
 * drifting right behind a longer location name.
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
    <p className={`flex flex-col gap-0.5 ${className ?? ""}`}>
      {game.location && <span className="truncate">{game.location}</span>}

      {href && (
        <a
          href={href}
          // A map leaves the site entirely; keep the schedule open behind it.
          target="_blank"
          rel="noopener noreferrer"
          className="self-start font-medium text-blue underline underline-offset-4 transition duration-200 ease-out hover:opacity-70 active:opacity-60"
        >
          Field Directions
        </a>
      )}
    </p>
  );
}
