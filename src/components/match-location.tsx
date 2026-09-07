import { type Game, mapsUrl } from "@/lib/data/schedule";

/**
 * The venue, linked to a map when the game carries an address. Renders nothing
 * when the game has neither, so callers don't need their own guard.
 *
 * The label is the friendly `location` — the address is navigation data, not
 * something to print in a schedule row. It stands in as the label only when
 * there is no location, so a half-filled row still shows where the game is.
 */
export function MatchLocation({
  game,
  className,
}: {
  game: Game;
  className?: string;
}) {
  const label = game.location ?? game.address;
  if (!label) return null;

  const href = mapsUrl(game);

  return (
    <p className={className}>
      {href ? (
        <a
          href={href}
          // A map leaves the site entirely; keep the schedule open behind it.
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-border-strong underline-offset-4 transition hover:text-foreground hover:decoration-current"
        >
          {label}
        </a>
      ) : (
        label
      )}
    </p>
  );
}
