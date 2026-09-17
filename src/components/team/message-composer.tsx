"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { sendReminder } from "@/app/team/actions";
import { AvailabilityBadge } from "@/components/team/availability-badge";
import type { AvailabilityStatus } from "@/lib/data/availability";

export type Recipient = {
  rosterId: string;
  name: string;
  number: number | null;
  hasPhone: boolean;
  status: AvailabilityStatus | null;
};

const QUICK =
  "rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium transition hover:bg-surface";

/**
 * The app's `MessageComposerView`: an editable message, three quick picks
 * (No Response, Select All, Clear) and a checkbox per player. Opens with the
 * non-responders checked, since chasing them is what the screen is for.
 */
export function MessageComposer({
  recipients,
  template,
  backHref,
}: {
  recipients: Recipient[];
  template: string;
  backHref: string;
}) {
  const noResponse = new Set(
    recipients.filter((member) => member.status === null).map((member) => member.rosterId),
  );
  const [selected, setSelected] = useState<Set<string>>(noResponse);
  const [state, formAction, pending] = useActionState(sendReminder, null);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // The button counts players who can actually be texted, as the app does.
  const sendable = recipients.filter(
    (member) => selected.has(member.rosterId) && member.hasPhone,
  ).length;

  if (state?.sent !== undefined) {
    return (
      <div className="py-8 text-center">
        <p className="headline text-lg">Sent</p>
        <p className="mt-1 text-sm text-muted">
          Reminder sent to {state.sent} {state.sent === 1 ? "player" : "players"}.
        </p>
        <Link
          href={backHref}
          className="mt-5 inline-block rounded-md bg-navy px-4 py-2 text-sm font-semibold text-yellow"
        >
          OK
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <label className="field-label" htmlFor="message">
        Message
      </label>
      <textarea
        id="message"
        name="message"
        rows={4}
        required
        defaultValue={template}
        className="field"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setSelected(new Set(noResponse))} className={QUICK}>
          No Response
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set(recipients.map((member) => member.rosterId)))}
          className={QUICK}
        >
          Select All
        </button>
        <button type="button" onClick={() => setSelected(new Set())} className={QUICK}>
          Clear
        </button>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
        Players ({selected.size} selected)
      </p>
      <ul className="mt-2 divide-y divide-border rounded-lg bg-surface">
        {recipients.map((member) => (
          <li key={member.rosterId}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="roster_id"
                value={member.rosterId}
                checked={selected.has(member.rosterId)}
                onChange={() => toggle(member.rosterId)}
                className="size-4 accent-navy"
              />
              <span className="w-9 shrink-0 text-right font-mono text-xs font-semibold text-muted">
                {member.number !== null ? `#${member.number}` : ""}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {member.name}
                {!member.hasPhone && (
                  <span className="ml-1 text-xs text-muted">(no phone)</span>
                )}
              </span>
              {member.status ? (
                <AvailabilityBadge status={member.status} />
              ) : (
                <span className="text-xs text-muted">No response</span>
              )}
            </label>
          </li>
        ))}
      </ul>

      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-orange-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={sendable === 0 || pending}
        className="mt-4 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-yellow transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sending…" : `Send (${sendable})`}
      </button>
    </form>
  );
}
