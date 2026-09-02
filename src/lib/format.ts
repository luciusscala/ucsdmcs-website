/**
 * All dates are formatted in the club's local timezone so server and client
 * render identically (no hydration mismatch).
 */
const TZ = "America/Los_Angeles";

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts });

/**
 * Date-only strings ("2026-09-27") parse as UTC midnight, which lands on the
 * previous day once formatted in Pacific time — anchor those to midday UTC.
 * Full timestamps carry their own offset and pass through untouched.
 */
const parse = (iso: string) =>
  new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso);

export const formatMatchDate = (iso: string) =>
  fmt({ weekday: "short", month: "short", day: "numeric" }).format(parse(iso));

export const formatMatchDateLong = (iso: string) =>
  fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(
    parse(iso),
  );

export const formatMatchTime = (iso: string) =>
  fmt({ hour: "numeric", minute: "2-digit" }).format(parse(iso));

export const formatMonth = (iso: string) =>
  fmt({ month: "long", year: "numeric" }).format(parse(iso));

export const formatDayNumber = (iso: string) =>
  fmt({ day: "numeric" }).format(parse(iso));

export const formatMonthShort = (iso: string) =>
  fmt({ month: "short" }).format(parse(iso));

/** Article bylines: "October 4, 2026". */
export const formatArticleDate = (iso: string) =>
  fmt({ month: "long", day: "numeric", year: "numeric" }).format(parse(iso));
