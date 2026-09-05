import Image from "next/image";
import Link from "next/link";

import { getPlayers } from "@/lib/data/roster";
import { getGames, nextGame, seasonRecord } from "@/lib/data/schedule";
import { formatGameDate, formatTime } from "@/lib/format";

/** Serve a static page, refreshed at most every five minutes. */
export const revalidate = 300;

function EntryCard({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg bg-background p-5 text-foreground transition hover:bg-surface"
    >
      <h2 className="headline text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </Link>
  );
}

export default async function Home() {
  // Both pages already tolerate an outage; the homepage does the same rather
  // than letting a failed fetch take down the site's front door.
  const [games, players] = await Promise.all([
    getGames().catch((error) => {
      console.error(error);
      return [];
    }),
    getPlayers().catch((error) => {
      console.error(error);
      return [];
    }),
  ]);

  const next = nextGame(games);
  const record = seasonRecord(games);

  return (
    <div className="container-page py-14 sm:py-20">
      <section className="flex flex-col items-center text-center">
        <Image
          src="/logos/ucsdtridentlogo.png"
          alt=""
          width={112}
          height={112}
          className="size-24 sm:size-28"
          priority
        />
        <h1 className="headline mt-6 text-4xl sm:text-5xl">
          UC San Diego Men&rsquo;s Club Soccer
        </h1>
        <p className="mt-3 max-w-xl text-white/70">
          Fixtures, results and the squad for the Tritons&rsquo; club season.
        </p>
        {record.played > 0 && (
          <p className="mt-5 text-sm text-yellow">
            {record.w}&ndash;{record.d}&ndash;{record.l} through{" "}
            {record.played} {record.played === 1 ? "game" : "games"}
          </p>
        )}
      </section>

      {next && (
        <section className="mt-12">
          <h2 className="text-sm font-medium text-yellow">Next match</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-background p-5 text-foreground">
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">
                  {formatGameDate(next.kickoff)}
                </span>
                <span className="text-muted"> / {formatTime(next.kickoff)}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-2">
                <span className="shrink-0 rounded-sm bg-navy px-1.5 py-0.5 text-xs font-bold uppercase text-yellow">
                  {next.isHome ? "vs" : "at"}
                </span>
                <span className="headline truncate text-lg sm:text-xl">
                  {next.opponent}
                </span>
              </p>
            </div>
            {next.location && (
              <p className="w-full truncate text-sm text-muted md:w-auto md:max-w-xs">
                {next.location}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <EntryCard
          href="/schedule"
          title="Schedule & Results"
          detail={
            games.length > 0
              ? `${games.length} ${games.length === 1 ? "game" : "games"} this season`
              : "Fixtures and final scores"
          }
        />
        <EntryCard
          href="/roster"
          title="Roster"
          detail={
            players.length > 0
              ? `${players.length} ${players.length === 1 ? "player" : "players"}`
              : "The full squad"
          }
        />
      </section>
    </div>
  );
}
