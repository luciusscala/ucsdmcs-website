"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { type ActionState, bulkAction } from "@/app/team/actions";
import { type ScheduleItem, EventRow } from "@/components/team/event-row";

export type ScheduleGroup = {
  key: string;
  heading: string;
  items: ScheduleItem[];
};

const BAR_BUTTON =
  "px-4 py-3 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50";

/**
 * The app's schedule list with its selection mode. Normally every row is a
 * link to the event; "Select" turns the rows into checkboxes and raises a bar
 * with Going, Not Going and, for captains, Delete. The whole list is one form,
 * so the bar's buttons submit whichever rows are checked.
 */
export function EventList({
  groups,
  captain,
}: {
  groups: ScheduleGroup[];
  captain: boolean;
}) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = groups.flatMap((group) => group.items.map((item) => item.id));
  const allSelected = allIds.length > 0 && selected.size === allIds.length;

  const exitSelection = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Wrapping the action lets a successful submit leave selection mode, which
  // the bare action state can't signal (success is `null`, same as the start).
  const [state, formAction, pending] = useActionState(
    async (previous: ActionState, data: FormData) => {
      const result = await bulkAction(previous, data);
      if (!result?.error) exitSelection();
      return result;
    },
    null,
  );

  return (
    <form action={formAction}>
      <div className="flex items-center justify-between gap-3">
        {selecting ? (
          <>
            <button
              type="button"
              onClick={() =>
                setSelected(allSelected ? new Set() : new Set(allIds))
              }
              className="text-sm font-medium text-blue"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <button
              type="button"
              onClick={exitSelection}
              className="text-sm font-semibold text-blue"
            >
              Done
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSelecting(true)}
            className="text-sm font-medium text-blue"
          >
            Select
          </button>
        )}
      </div>

      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-orange-700">
          {state.error}
        </p>
      )}

      {groups.map((group) => (
        <section key={group.key} className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            {group.heading}
          </h2>
          <ul className="mt-2 divide-y divide-border border border-border">
            {group.items.map((item) => (
              <li key={item.id}>
                {selecting ? (
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-3 transition hover:bg-surface">
                    <input
                      type="checkbox"
                      name="event_id"
                      value={item.id}
                      checked={selected.has(item.id)}
                      onChange={() => toggle(item.id)}
                      className="size-5 accent-navy"
                    />
                    <EventRow item={item} />
                  </label>
                ) : (
                  <Link
                    href={`/team/events/${item.id}`}
                    className="flex items-center px-3 py-3 transition hover:bg-surface active:bg-border"
                  >
                    <EventRow item={item} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* The app's floating capsule. Sticky above the tab bar on phones. */}
      {selecting && selected.size > 0 && (
        <div className="sticky bottom-20 z-10 mt-6 flex justify-center md:bottom-4">
          <div className="flex items-center overflow-hidden rounded-full border border-border bg-background shadow-lg">
            <button
              type="submit"
              name="intent"
              value="yes"
              disabled={pending}
              className={`${BAR_BUTTON} text-going`}
            >
              ✓ Going
            </button>
            <button
              type="submit"
              name="intent"
              value="no"
              disabled={pending}
              className={`${BAR_BUTTON} text-not-going`}
            >
              ✕ Not Going
            </button>
            {captain && (
              <button
                type="submit"
                name="intent"
                value="delete"
                disabled={pending}
                onClick={(event) => {
                  const count = selected.size;
                  if (
                    !window.confirm(
                      `Delete ${count} ${count === 1 ? "event" : "events"}? This will permanently delete the selected events and all associated availability data.`,
                    )
                  ) {
                    event.preventDefault();
                  }
                }}
                className={`${BAR_BUTTON} border-l border-border text-red-700`}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
