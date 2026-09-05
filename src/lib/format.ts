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
