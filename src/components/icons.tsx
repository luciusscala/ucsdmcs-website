import type { ReactNode } from "react";

/**
 * Contact and social marks, shared by the footer and the homepage.
 *
 * All three are drawn as strokes at one weight rather than borrowed from the
 * brand kits: Instagram ships as linework and Facebook as a solid disc, and
 * side by side at this size the disc reads about twice as heavy. The envelope
 * is drawn to the same weight so the row stays even.
 *
 * Keyed by the label the rest of the site already uses for each account.
 */
const PATHS: Record<string, ReactNode> = {
  Instagram: (
    <>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  Facebook: (
    <>
      <circle cx="12" cy="12" r="9.4" />
      <path d="M14.9 7.7h-1.3a2.3 2.3 0 0 0-2.3 2.3v11.4M9 13.4h5.6" />
    </>
  ),
  Email: (
    <>
      <rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2.6" />
      <path d="m3.6 7 8.4 5.7L20.4 7" />
    </>
  ),
};

/** Decorative by default: every use sits beside its own visible label. */
export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
