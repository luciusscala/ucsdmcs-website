/**
 * Home page copy and the carousel running order. Photos themselves are
 * registered in `media` in src/lib/site.ts.
 */
import { type Media, media } from "@/lib/site";

/** TODO: officers should confirm the training cadence line before this ships. */
export const intro = {
  heading: "UC San Diego",
  headingAccent: "Men's Club Soccer",
  body: [
    "We are a student-run team competing in the US College Club Soccer SoCal Conference — a step below varsity, open to any enrolled UC San Diego student who can play.",
    "The squad trains twice a week at RIMAC Field, travels across Southern California for conference fixtures through the fall, and plays for a place at the USCCS regionals in November.",
  ],
} as const;

/** Running order for the home carousel. Each photo's alt text lives in `media`. */
export const slides: Media[] = [
  media.breakaway,
  media.night,
  media.celebration,
  media.action,
];
