import { createClient } from "@supabase/supabase-js";

/**
 * Supabase wants the bare project origin, because the client appends its own
 * `/rest/v1` and `/storage/v1` paths. A pasted URL that still carries a path
 * would be joined into `/rest/v1/rest/v1/...`, which the gateway rejects with
 * "Invalid path specified in request URL", so trim to the origin.
 */
function projectOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    console.error(`SUPABASE_URL is not a valid URL: ${raw}`);
    return null;
  }
}

const url = projectOrigin(process.env.SUPABASE_URL);

/**
 * Publishable key (`sb_publishable_...`). It respects RLS, so every table the
 * public pages read needs a read policy: `seasons`, `events`, `games`, `teams`,
 * `fields`, `roster` and `people`. Never a secret key here.
 */
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

/** Storage bucket holding the images referenced by `logo_path`. */
const LOGO_BUCKET = process.env.SUPABASE_LOGO_BUCKET ?? "logos";

/**
 * Server-side Supabase client.
 *
 * Returns null when credentials are absent so a build without a `.env.local`
 * still succeeds — callers degrade to an empty result rather than throwing.
 */
export const supabase = url && key ? createClient(url, key) : null;

/**
 * Resolves a stored object key to a public URL. An absolute URL is passed
 * through untouched, so an image hosted elsewhere still works.
 */
function publicUrl(bucket: string, path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!supabase) return null;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Resolves a `teams.logo_path`. */
export const logoUrl = (path: string | null) => publicUrl(LOGO_BUCKET, path);

/**
 * Unwraps a to-one embed. PostgREST returns it as an object, but supabase-js
 * widens the type to an array in some inference paths. Normalising here means
 * a shape change can't blank out every opponent name silently.
 */
export function one<T>(embed: T | T[] | null | undefined): T | null {
  if (Array.isArray(embed)) return embed[0] ?? null;
  return embed ?? null;
}
