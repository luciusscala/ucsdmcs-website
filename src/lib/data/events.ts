/**
 * `events.event_type` values. Games, practices, tournaments and socials all
 * keep their season and date on a shared `events` row; the type says which
 * table the rest of the record lives in.
 */
export const EVENT_TYPE = {
  game: "game",
  practice: "practice",
  social: "social",
  tournament: "tournament",
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
