/**
 * Every date is rendered in the team's local zone rather than the server's, so
 * a build machine in UTC can't shift a 7pm kickoff onto the following day.
 */
const TIME_ZONE = "America/Los_Angeles";

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: TIME_ZONE });

const dayFormat = fmt({ month: "short", day: "numeric" });
const weekdayFormat = fmt({ weekday: "short" });
const hourFormat = fmt({ hour: "numeric" });
const hourMinuteFormat = fmt({ hour: "numeric", minute: "2-digit" });

/** "Oct 24 (Sat)" — each row carries its own month, so the list needs no headings. */
export function formatGameDate(iso: string) {
  const date = new Date(iso);
  return `${dayFormat.format(date)} (${weekdayFormat.format(date)})`;
}

/** "7 PM", or "7:30 PM" when the kickoff isn't on the hour. */
export function formatTime(iso: string) {
  const date = new Date(iso);
  const minute = hourMinuteFormat
    .formatToParts(date)
    .find((part) => part.type === "minute")?.value;

  return minute === "00" ? hourFormat.format(date) : hourMinuteFormat.format(date);
}

/** The zone's UTC offset in ms at a given instant, DST included. */
function zoneOffsetMs(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );

  return asUtc - timestamp;
}

/** "2026-10-17T19:00" in the team's zone — what a datetime-local input wants. */
export function toDateTimeLocal(iso: string) {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "";
  return new Date(timestamp + zoneOffsetMs(timestamp)).toISOString().slice(0, 16);
}

/**
 * The reverse. A datetime-local value is wall-clock time carrying no zone, so
 * `new Date(value)` would read it in the *server's* zone — a 7pm kickoff typed
 * in San Diego would land at noon once deployed to a UTC host. This pins it to
 * the team's zone instead.
 *
 * The offset depends on the instant we're solving for, so it iterates twice:
 * the first pass picks the offset, the second re-solves with it. That settles
 * the DST boundary, where the naive guess can land an hour out.
 */
export function fromDateTimeLocal(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);

  let timestamp = wallClock;
  for (let pass = 0; pass < 2; pass += 1) {
    timestamp = wallClock - zoneOffsetMs(timestamp);
  }

  return new Date(timestamp).toISOString();
}
