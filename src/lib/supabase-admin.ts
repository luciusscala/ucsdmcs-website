import { createClient } from "@supabase/supabase-js";

import "server-only";

/**
 * Write client for the admin dashboard.
 *
 * The secret key bypasses RLS entirely, so this must never be imported into a
 * client component — `server-only` makes that a build error rather than a leak.
 * Every caller is responsible for its own `requireAdmin()` check.
 */
const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

function origin(raw: string | undefined) {
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

const resolved = origin(url);

export const supabaseAdmin =
  resolved && secretKey ? createClient(resolved, secretKey) : null;

/** False when the secret key is missing, so pages can explain rather than 500. */
export const isAdminConfigured = () => supabaseAdmin !== null;

export function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set.");
  }
  return supabaseAdmin;
}
