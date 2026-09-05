import type { NextConfig } from "next";

// Trimmed to the origin for the same reason as src/lib/supabase.ts.
let supabaseOrigin: string | null = null;
try {
  if (process.env.SUPABASE_URL) {
    supabaseOrigin = new URL(process.env.SUPABASE_URL).origin;
  }
} catch {
  supabaseOrigin = null;
}

const nextConfig: NextConfig = {
  images: {
    // School crests are served from the project's public storage bucket.
    remotePatterns: supabaseOrigin
      ? [new URL(`${supabaseOrigin}/storage/v1/object/public/**`)]
      : [],
  },
};

export default nextConfig;
