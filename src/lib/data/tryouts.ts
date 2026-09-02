/**
 * Tryout information. TODO: confirm dates, times and fees with the officers
 * each fall before the page goes live.
 */

export type TryoutSession = {
  id: string;
  /** ISO 8601, same convention as schedule.ts */
  date: string;
  label: string;
  venue: string;
  note?: string;
};

export const tryouts = {
  /** Shown as the headline status on the page and the home band. */
  status: "Open — fall quarter",
  summary:
    "Tryouts run over the first week of fall quarter and are open to every currently enrolled UC San Diego student. No prior club experience needed — come to all three sessions if you can.",
  fee: "$180 per season, due after the roster is set",
} as const;

export const tryoutSessions: TryoutSession[] = [
  {
    id: "t1",
    date: "2026-09-28T18:00:00-07:00",
    label: "Session 1 — Open session",
    venue: "RIMAC Field",
    note: "Check-in opens 30 minutes early",
  },
  {
    id: "t2",
    date: "2026-09-30T18:00:00-07:00",
    label: "Session 2 — Small-sided play",
    venue: "RIMAC Field",
  },
  {
    id: "t3",
    date: "2026-10-02T17:30:00-07:00",
    label: "Session 3 — Full-sided scrimmage",
    venue: "RIMAC Field",
    note: "Invite only, sent by email the night before",
  },
];

export const eligibility: string[] = [
  "Currently enrolled UC San Diego undergraduate or graduate student",
  "Active UC San Diego Recreation membership",
  "Completed waiver on file with Rec Sports before stepping on the field",
  "No NCAA varsity soccer eligibility used in the current academic year",
];

export const whatToBring: string[] = [
  "Cleats and molded trainers — surface can change session to session",
  "Shin guards (required to take the field)",
  "Both a light and a dark shirt",
  "Water — there is no fountain at the field",
];

export const faq: { question: string; answer: string }[] = [
  {
    question: "Do I need to register in advance?",
    answer:
      "No. Show up to the first session and check in with an officer. Registering your name and email at check-in is how you get the follow-up emails.",
  },
  {
    question: "What if I miss the first session?",
    answer:
      "Come to the next one. Let us know by email beforehand so we know to expect you and can add you to the list.",
  },
  {
    question: "How many players make the squad?",
    answer:
      "Roughly 22 to 25, depending on the year. Everyone who tries out hears back by email either way.",
  },
  {
    question: "Is there a fee?",
    answer:
      "Trying out is free. Players who make the roster pay season dues, which cover league registration, referees, travel and kit.",
  },
  {
    question: "What is the time commitment?",
    answer:
      "Two training sessions a week plus a weekend fixture, with conference away trips roughly once a month during the season.",
  },
];
