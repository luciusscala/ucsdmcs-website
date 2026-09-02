/**
 * All dates are formatted in the club's local timezone so server and client
 * render identically (no hydration mismatch).
 */
const TZ = "America/Los_Angeles";

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts });

export const formatMatchDate = (iso: string) =>
  fmt({ weekday: "short", month: "short", day: "numeric" }).format(new Date(iso));

export const formatMatchDateLong = (iso: string) =>
  fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );

export const formatMatchTime = (iso: string) =>
  fmt({ hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export const formatMonth = (iso: string) =>
  fmt({ month: "long", year: "numeric" }).format(new Date(iso));

export const formatDayNumber = (iso: string) =>
  fmt({ day: "numeric" }).format(new Date(iso));

export const formatMonthShort = (iso: string) =>
  fmt({ month: "short" }).format(new Date(iso));
