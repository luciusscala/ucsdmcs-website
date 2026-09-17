import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { leaveTeam, selectRoster } from "@/app/team/actions";
import { OnboardingCard } from "@/components/team/onboarding-card";
import { getCurrentSeason, getRoster } from "@/lib/data/team";
import { isComplete, readTeamSession } from "@/lib/team-session";

export const metadata: Metadata = { title: "Select your name" };

export default async function RosterStepPage() {
  const session = await readTeamSession();
  if (!session) redirect("/team/join");
  if (isComplete(session)) redirect("/team");

  const season = await getCurrentSeason();
  const roster = season ? await getRoster(season.id) : [];

  // Alphabetical here, as in the app: a new player is looking for their own
  // name, not their number.
  const byName = [...roster].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <OnboardingCard title="Select Your Name" subtitle="Tap your name on the roster">
      {!season ? (
        <p className="text-sm text-muted">
          No current season found. Ask a captain to mark one as current.
        </p>
      ) : byName.length === 0 ? (
        <p className="text-sm text-muted">No players found for the current season.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {byName.map((member) => (
            <li key={member.rosterId}>
              {/* One tiny form per name: a tap is the whole step, no confirm. */}
              <form action={selectRoster}>
                <input type="hidden" name="roster_id" value={member.rosterId} />
                <button
                  type="submit"
                  className="flex w-full items-center justify-between py-3 text-left text-sm transition hover:bg-surface"
                >
                  <span className="font-medium">{member.name}</span>
                  <span aria-hidden className="text-muted">
                    ›
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={leaveTeam} className="mt-6 text-center">
        <button type="submit" className="text-sm text-red-700 hover:underline">
          Not the right team?
        </button>
      </form>
    </OnboardingCard>
  );
}
