import { unstable_cache } from "next/cache";

/**
 * One tag covering every Supabase read the public pages make.
 *
 * Deliberately not one tag per table. `revalidatePublic()` in the admin actions
 * already treats the public site as a single unit — any edit refreshes all of
 * it — and matching that keeps the two ends from drifting into a bug where a
 * write forgets to purge a table it quietly affects. Editing a game does throw
 * away the cached roster too, but refilling costs one query, once.
 */
export const PUBLIC_DATA = "public-data";

/**
 * Persists a database read across requests until an admin edit purges it.
 *
 * Without this every visitor pays their own round trip to Supabase for data
 * that changes a few times a season. With it, the first request after an edit
 * pays, and everyone after that is served from the cache.
 *
 * No `revalidate` time: the data is correct until someone changes it, and the
 * admin actions say when that happens. A timer would only add a window where
 * the site is knowingly wrong.
 *
 * `keyPart` is only for legibility — `unstable_cache` already keys on the
 * function's arguments, so `getGames(seasonId)` can't collide across seasons.
 */
export function cached<Args extends unknown[], Result>(
  keyPart: string,
  read: (...args: Args) => Promise<Result>,
) {
  return unstable_cache(read, [keyPart], { tags: [PUBLIC_DATA] });
}
