/**
 * Stand-in for a page whose data is still being fetched, shaped like the card
 * every page renders into so the layout doesn't jump when the real content
 * lands.
 *
 * Its second job is prefetching: a dynamic route is only prefetched as far as
 * its nearest `loading` boundary, so having one is what makes a tap on the nav
 * feel immediate rather than leaving the previous page on screen while the
 * server round-trips.
 *
 * The pulse is dropped automatically for anyone who asks for reduced motion —
 * see the media query in `globals.css`.
 */
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="container-page py-8 sm:py-10">
      <div
        role="status"
        className="rounded-xl bg-background p-4 text-foreground sm:p-6"
      >
        <span className="sr-only">Loading</span>

        <div className="h-7 w-2/3 max-w-xs animate-pulse rounded bg-border sm:h-8" />
        <div className="mt-4 h-11 animate-pulse bg-surface" />

        <div className="mt-4 space-y-2" aria-hidden="true">
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="h-12 animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
