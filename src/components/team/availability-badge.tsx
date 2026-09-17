import { type AvailabilityStatus, STATUS_LABEL } from "@/lib/data/availability";

/** "Going" / "Not Going" pill, tinted like the app's `AvailabilityBadge`. */
export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        status === "yes"
          ? "bg-going/15 text-going"
          : "bg-not-going/15 text-not-going"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
