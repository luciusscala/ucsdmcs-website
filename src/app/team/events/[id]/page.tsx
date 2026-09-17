import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteEvent } from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AvailabilityBadge } from "@/components/team/availability-badge";
import { AvailabilityPicker } from "@/components/team/availability-picker";
import { TYPE_COLOR } from "@/components/team/event-row";
import { MemberList } from "@/components/team/member-list";
import {
  type AvailabilityStatus,
  getAvailability,
  getCurrentSeason,
  getEvent,
  getRoster,
  withoutResponse,
} from "@/lib/data/team";
import { formatDayHeading, formatTime } from "@/lib/format";
import { requireTeamSession } from "@/lib/team-session";

export const metadata: Metadata = { title: "Event" };

const STATUSES: AvailabilityStatus[] = ["yes", "no"];

const LINK =
  "text-sm font-medium text-blue underline underline-offset-4 transition hover:opacity-70";

export default async function EventPage(props: PageProps<"/team/events/[id]">) {
  const session = await requireTeamSession();
  const { id } = await props.params;

  const [event, season] = await Promise.all([getEvent(id), getCurrentSeason()]);
  if (!event) notFound();

  const [roster, availability] = await Promise.all([
    season ? getRoster(season.id) : [],
    getAvailability([event.id]),
  ]);
  const responses = availability.get(event.id) ?? [];
  const byRoster = new Map(roster.map((member) => [member.rosterId, member]));

  const myStatus =
    responses.find((response) => response.rosterId === session.rosterId)?.status ?? null;

  const membersWith = (status: AvailabilityStatus) =>
    responses
      .filter((response) => response.status === status)
      .flatMap((response) => {
        const member = byRoster.get(response.rosterId);
        return member ? [member] : [];
      });

  const noResponse = withoutResponse(roster, responses);

  const directions = event.address
    ? `https://maps.google.com/?q=${encodeURIComponent(event.address)}`
    : null;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/team" className={LINK}>
            ‹ Schedule
          </Link>

          {session.captain && (
            <div className="flex items-center gap-4">
              <Link href={`/team/events/${event.id}/remind`} className={LINK}>
                Remind
              </Link>
              {(event.type === "practice" || event.type === "game") && (
                <Link href={`/team/events/${event.id}/edit`} className={LINK}>
                  Edit
                </Link>
              )}
              <AdminForm
                action={deleteEvent}
                submitLabel="Delete"
                destructive
                confirm="Are you sure you want to delete this event? This cannot be undone."
              >
                <input type="hidden" name="event_id" value={event.id} />
              </AdminForm>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="mt-4 rounded-xl bg-surface p-4">
          {event.type === "game" ? (
            <div className="flex items-center gap-3">
              {event.opponentLogo && (
                <Image
                  src={event.opponentLogo}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-lg object-contain"
                />
              )}
              <div>
                <h1 className="headline text-lg">{event.title}</h1>
                <p className="text-xs text-muted">{event.isHome ? "Home" : "Away"}</p>
              </div>
            </div>
          ) : (
            <h1 className={`headline text-lg ${TYPE_COLOR[event.type]}`}>{event.title}</h1>
          )}

          <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <p>{formatDayHeading(event.date)}</p>
            <p className="text-muted">{formatTime(event.date)}</p>
            {event.location &&
              (directions ? (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue"
                >
                  {event.location}
                  <span aria-hidden className="text-xs">
                    ↗
                  </span>
                </a>
              ) : (
                <p className="text-muted">{event.location}</p>
              ))}
          </div>

          {event.notes && (
            <p className="mt-3 border-t border-border pt-3 text-sm text-muted">
              {event.notes}
            </p>
          )}
        </div>

        {/* Your availability */}
        <h2 className="headline mt-6 text-base">Your Availability</h2>
        <div className="mt-2">
          <AvailabilityPicker eventId={event.id} selected={myStatus} />
        </div>

        {/* Team responses */}
        <h2 className="headline mt-8 text-base">Team Responses</h2>

        {STATUSES.map((status) => {
          const members = membersWith(status);
          if (members.length === 0) return null;
          return (
            <div key={status} className="mt-4">
              <p className="flex items-center gap-2">
                <AvailabilityBadge status={status} />
                <span className="text-sm text-muted">({members.length})</span>
              </p>
              <div className="mt-2">
                <MemberList members={members} />
              </div>
            </div>
          );
        })}

        {noResponse.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted">
              No Response <span className="font-normal">({noResponse.length})</span>
            </p>
            <div className="mt-2">
              <MemberList members={noResponse} muted />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
