/**
 * The availability vocabulary, kept apart from the server-only reads so the
 * picker and badges (client components) can share it.
 */
export type AvailabilityStatus = "yes" | "no";

export const STATUS_LABEL: Record<AvailabilityStatus, string> = {
  yes: "Going",
  no: "Not Going",
};

export const isStatus = (value: unknown): value is AvailabilityStatus =>
  value === "yes" || value === "no";
