import type { Metadata } from "next";
import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";
import { ABOUT, ACCOLADES, OFFICERS } from "@/lib/club";
import { formatTally, getGames, seasonRecord } from "@/lib/data/schedule";

export const metadata: Metadata = {
  description:
    "UC San Diego men's club soccer — who we are, how the season runs, and how to reach us.",
};

/** Serve a static page, refreshed at most every five minutes. */
export const revalidate = 300;

export default async function Home() {
  // The schedule already tolerates an outage; the homepage does the same rather
  // than letting a failed fetch take down the site's front door.
  const games = await getGames().catch((error) => {
    console.error(error);
    return [];
  });

  const record = seasonRecord(games);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        {/* Shown whole at its own 3810x2521, so nobody in the squad is cropped
            out. The intrinsic size lets the browser hold the right space before
            it loads, which keeps the heading below from jumping. */}
        <Image
          src="/team_photo.JPG"
          alt="The UC San Diego men's club soccer squad, lined up in front of a goal."
          width={3810}
          height={2521}
          priority
          sizes="(min-width: 1216px) 1168px, 100vw"
          className="h-auto w-full rounded-lg"
        />

        <h1 className="headline mt-5 text-xl sm:text-2xl">
          UC San Diego Men&rsquo;s Club Soccer
        </h1>

        {record.played > 0 && (
          <p className="mt-3 text-sm">
            <span className="headline tabular-nums">
              {formatTally(record.overall)}
            </span>{" "}
            <span className="text-muted">
              through {record.played} {record.played === 1 ? "game" : "games"}
            </span>
          </p>
        )}

        <div className="mt-6 space-y-3 text-sm leading-relaxed sm:text-base">
          {ABOUT.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <SectionHeading>Recent accolades</SectionHeading>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ACCOLADES.map((accolade) => (
            <li
              key={accolade}
              className="bg-navy px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-yellow"
            >
              {accolade}
            </li>
          ))}
        </ul>

        <SectionHeading>Executives</SectionHeading>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          {OFFICERS.map((officer) => (
            <div key={officer.role} className="bg-surface px-4 py-3">
              <dt className="text-xs uppercase tracking-wider text-muted">
                {officer.role}
              </dt>
              <dd className="mt-1">
                <span className="headline block">{officer.name}</span>
                <a
                  href={`mailto:${officer.email}`}
                  className="mt-0.5 block truncate text-sm text-blue underline underline-offset-4 transition duration-200 ease-out hover:opacity-70 active:opacity-60"
                >
                  {officer.email}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
