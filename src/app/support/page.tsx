import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { TEAM_EMAIL } from "@/lib/club";

export const metadata: Metadata = {
  title: "App Support",
  description:
    "Help with the UC San Diego Men's Club Soccer app: joining a team, availability, reminders, and how to reach the club.",
};

const LINK =
  "font-medium text-blue underline underline-offset-4 transition duration-200 ease-out hover:opacity-70 active:opacity-60";

/** The App Store links here from the app's product page, so it opens with the
 *  contact address and then answers the questions that would have been sent
 *  to it. Written as content rather than markup for the same reason the
 *  privacy policy is: whoever holds the office has to be able to edit it. */
const STEPS = [
  "Ask a captain for the team code. There is no sign-up and no password — the code is the only way in.",
  "Enter it, then tap your own name on the roster.",
  "Add your phone number if you want text reminders, or skip it. That is the whole setup.",
];

const QUESTIONS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "I don't have a team code.",
    answer:
      "Captains hand them out, usually in the team group chat. Ask one of them, or email the club at the address above.",
  },
  {
    question: "My name isn't on the roster list.",
    answer:
      "The list is the current season's roster, which captains manage. If you have just joined the club, ask a captain to add you, then reopen the app.",
  },
  {
    question: "I tapped the wrong name, or joined the wrong team.",
    answer:
      "Settings → Leave Team. That clears the team and name from your device only; nothing on the roster changes. Then join again with the code.",
  },
  {
    question: "How do I say whether I can make a practice or game?",
    answer:
      "Open the event and choose Going or Not Going. You can change it whenever you like, and everyone on the team sees who has answered. Select on the schedule answers several events at once.",
  },
  {
    question: "Is my phone number required?",
    answer: (
      <>
        No — tap Skip and everything but the text reminders works the same. It
        is only used so captains can text the team about practices and games,
        and only captains can see it. You can add or remove one later in
        Settings on{" "}
        <Link href="/team" className={LINK}>
          the team site
        </Link>
        .
      </>
    ),
  },
  {
    question: "I'm not getting the text reminders.",
    answer:
      "They go to the number on file, so check that one is there — email the club to add or change yours. If you replied STOP to an earlier message, your carrier blocks the rest until you reply START.",
  },
  {
    question: "The schedule is empty.",
    answer:
      "It shows upcoming events for the current season, and past ones drop off on their own. An empty schedule means nothing has been added yet.",
  },
  {
    question: "I'm a captain. How do I add events or send reminders?",
    answer:
      "Settings → Admin Access, and enter the admin code the club passes between captains. Adding, editing and reminders appear once admin mode is on.",
  },
  {
    question: "How do I remove my information?",
    answer: (
      <>
        Leave Team clears everything the app kept on your device. To have your
        details taken out of the club&rsquo;s roster and database as well, email
        us and it will be handled within a few days. The{" "}
        <Link href="/privacy" className={LINK}>
          privacy policy
        </Link>{" "}
        covers what is stored and who can see it.
      </>
    ),
  },
  {
    question: "Something is broken.",
    answer:
      "Email the club with your iPhone model, your iOS version and what you were doing when it happened. It is a student-run club, so expect a reply within a few days rather than the same hour.",
  },
];

export default function SupportPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <h1 className="headline text-xl sm:text-2xl">App Support</h1>
        <p className="mt-1 text-sm text-muted">
          Help with the UC San Diego Men&rsquo;s Club Soccer app, for players
          and captains.
        </p>

        {/* First thing on the page: Apple's reviewers and a stuck player are
            both here for an address they can write to. */}
        <SectionHeading>Contact</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed sm:text-base">
          Email{" "}
          <a href={`mailto:${TEAM_EMAIL}`} className={LINK}>
            {TEAM_EMAIL}
          </a>{" "}
          with any question about the app, and someone will get back to you
          within a few days. The club runs the app itself; UC San Diego does
          not.
        </p>

        <SectionHeading>Getting started</SectionHeading>
        <ol className="mt-3 space-y-3 text-sm leading-relaxed sm:text-base">
          {STEPS.map((step, index) => (
            <li key={step.slice(0, 40)} className="flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          No iPhone? The same schedule, availability and captain tools run in
          any browser at{" "}
          <Link href="/team" className={LINK}>
            the team site
          </Link>
          .
        </p>

        <SectionHeading>Common questions</SectionHeading>
        <dl className="mt-3 divide-y divide-border">
          {QUESTIONS.map((item) => (
            <div key={item.question} className="py-4 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold sm:text-base">
                {item.question}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted sm:text-base">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
