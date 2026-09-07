import { getGames } from "@/lib/data/schedule";
import { getSeasonFor } from "@/lib/data/season";

/** RFC 5545 escaping: these characters are structural inside a value. */
const escape = (value: string) =>
  value.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");

/** RFC 5545 UTC form: 20261010T190000Z */
const stamp = (date: Date) =>
  `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

export async function GET() {
  const [games, season] = await Promise.all([
    getGames(),
    getSeasonFor("games"),
  ]);

  const now = stamp(new Date());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UC San Diego Men's Club Soccer//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escape(`UCSD Men's Club Soccer ${season?.year ?? ""}`.trim())}`,
  ];

  for (const game of games) {
    const kickoff = new Date(game.kickoff);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${game.id}@ucsdmcsc`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(kickoff)}`,
      // No end time in the data; two hours covers a match plus warmup.
      "DURATION:PT2H",
      `SUMMARY:${escape(`${game.isHome ? "vs" : "at"} ${game.opponent}`)}`,
    );
    // Both, so the entry reads as a venue but still geocodes. A Set guards
    // the case where the same string was pasted into each column.
    const place = [
      ...new Set([game.location, game.address].filter((part) => part)),
    ].join(", ");
    if (place) lines.push(`LOCATION:${escape(place)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="ucsd-mcsc-${season?.year ?? "schedule"}.ics"`,
    },
  });
}
