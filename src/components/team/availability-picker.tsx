"use client";

import { startTransition, useOptimistic } from "react";

import { setAvailability } from "@/app/team/actions";
import { type AvailabilityStatus, STATUS_LABEL } from "@/lib/data/availability";

const STATUSES: AvailabilityStatus[] = ["yes", "no"];

/** Written out in full: Tailwind only emits classes it can read verbatim. */
const STYLE: Record<AvailabilityStatus, { active: string; idle: string }> = {
  yes: {
    active: "border-2 border-going bg-going/15 text-going",
    idle: "border-going/30 text-going hover:bg-going/5",
  },
  no: {
    active: "border-2 border-not-going bg-not-going/15 text-not-going",
    idle: "border-not-going/30 text-not-going hover:bg-not-going/5",
  },
};

/**
 * The app's two-button picker. The tap is shown at once and the server
 * settles it: the optimistic value falls back to the real one if the write
 * fails, which is the app's revert-on-failure behaviour for free.
 */
export function AvailabilityPicker({
  eventId,
  selected,
}: {
  eventId: string;
  selected: AvailabilityStatus | null;
}) {
  const [shown, show] = useOptimistic(selected);

  const choose = (status: AvailabilityStatus) => {
    startTransition(async () => {
      show(status);
      await setAvailability(eventId, status);
    });
  };

  return (
    <div className="flex gap-3">
      {STATUSES.map((status) => {
        const active = shown === status;

        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => choose(status)}
            className={`flex-1 rounded-xl border py-3.5 text-sm font-semibold transition duration-200 ease-out active:scale-[0.98] ${
              active ? STYLE[status].active : STYLE[status].idle
            }`}
          >
            {STATUS_LABEL[status]}
          </button>
        );
      })}
    </div>
  );
}
