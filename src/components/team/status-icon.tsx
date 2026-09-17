import type { AvailabilityStatus } from "@/lib/data/availability";

/**
 * The app's trailing glyph on a schedule row: a filled check, a filled cross,
 * or a dashed ring for no answer yet. Colour comes from the availability
 * tokens so the list and the badges agree.
 */
export function StatusIcon({
  status,
  className = "size-6",
}: {
  status: AvailabilityStatus | null;
  className?: string;
}) {
  const label =
    status === "yes" ? "Going" : status === "no" ? "Not going" : "No response";

  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      className={`shrink-0 ${className} ${
        status === "yes"
          ? "text-going"
          : status === "no"
            ? "text-not-going"
            : "text-border-strong"
      }`}
    >
      {status === null ? (
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      ) : (
        <>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          {status === "yes" ? (
            <path
              d="m7.5 12.5 3 3 6-6"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="m8.5 8.5 7 7m0-7-7 7"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}
        </>
      )}
    </svg>
  );
}
