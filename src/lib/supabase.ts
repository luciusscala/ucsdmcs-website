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
 * Publishable key (`sb_publishable_...`). It respects RLS, so the database
 * needs a read policy on `games` and `schools`. Never a secret key here.
 */
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

/** Storage buckets holding the images referenced by `*_path` columns. */
const LOGO_BUCKET = process.env.SUPABASE_LOGO_BUCKET ?? "logos";
const HEADSHOT_BUCKET = process.env.SUPABASE_HEADSHOT_BUCKET ?? "player_pictures";

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

/** Resolves a `schools.logo_path`. */
export const logoUrl = (path: string | null) => publicUrl(LOGO_BUCKET, path);

/** Resolves a `players.picture_path`. */
export const headshotUrl = (path: string | null) =>
  publicUrl(HEADSHOT_BUCKET, path);
