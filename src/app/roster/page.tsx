import type { Metadata } from "next";
import { SplitHero } from "@/components/split-hero";
import { RosterFilter } from "@/components/roster-filter";
import { SectionHeading } from "@/components/section-heading";
import { roster, staff } from "@/lib/data/roster";
import { media, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Roster",
  description: `The ${site.season} UC San Diego men's club soccer roster and staff.`,
};

export default function RosterPage() {
  return (
    <>
      <SplitHero
        media={media.teamPhoto}
        eyebrow={`${site.season} Season`}
        title="Roster"
        priority
      >
        <p className="mt-4 max-w-md text-sm text-white/70">
          {roster.length} players · {site.league}
        </p>
      </SplitHero>

      <section className="container-page py-14">
        <RosterFilter players={roster} />
      </section>

      <section className="border-t border-border bg-surface py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Behind the squad" title="Staff & Officers" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <li
                key={`${member.role}-${member.name}`}
                className="border-l-[3px] border-blue bg-background px-5 py-4"
              >
                <p className="eyebrow text-[0.6875rem] text-blue">
                  {member.role}
                </p>
                <p className="headline mt-1 text-xl text-navy">{member.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
