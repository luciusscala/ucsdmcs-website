import type { Metadata } from "next";
import Link from "next/link";

import { type ScheduleGroup, EventList } from "@/components/team/event-list";
import {
  getAvailability,
  getCurrentSeason,
  getUpcomingEvents,
  groupByDay,
} from "@/lib/data/team";
import { formatTime } from "@/lib/format";
import { teamBase } from "@/lib/team-path";
import { requireTeamSession } from "@/lib/team-session";

export const metadata: Metadata = { title: "Team Schedule" };

/** The app's "+" menu: three ways to add to the schedule, captains only. */
const ADD_LINKS = [
  { path: "/new/practice", label: "Add Practice" },
  { path: "/new/practices", label: "Add Repeating Practices" },
  { path: "/new/game", label: "Add Game" },
];

export default async function TeamSchedulePage() {
  const session = await requireTeamSession();
  const base = await teamBase();

  const season = await getCurrentSeason();
  const events = season ? await getUpcomingEvents(season.id) : [];
  const availability = await getAvailability(events.map((event) => event.id));

  const groups: ScheduleGroup[] = groupByDay(events).map((group) => ({
    key: group.key,
    heading: group.heading,
    items: group.events.map((event) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      time: formatTime(event.date),
      location: event.location,
      opponentLogo: event.opponentLogo,
      myStatus:
        availability
          .get(event.id)
          ?.find((response) => response.rosterId === session.rosterId)?.status ??
        null,
    })),
  }));

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="headline text-xl sm:text-2xl">Schedule</h1>

          {session.captain && (
            // A native disclosure: no script, closes on navigation.
            <details className="relative">
              <summary
                aria-label="Add to schedule"
                className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-navy text-xl leading-none text-yellow transition hover:opacity-90 [&::-webkit-details-marker]:hidden"
              >
                +
              </summary>
              <ul className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                {ADD_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={`${base}${link.path}`}
                      className="block px-4 py-2.5 text-sm transition hover:bg-surface"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="py-16 text-center">
            <p className="headline text-lg">No Upcoming Events</p>
            <p className="mt-1 text-sm text-muted">
              Check back later for new practices and games.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <EventList groups={groups} captain={session.captain} base={base} />
          </div>
        )}
      </div>
    </div>
  );
}
