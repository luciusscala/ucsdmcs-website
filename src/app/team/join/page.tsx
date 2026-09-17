import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { joinTeam } from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { OnboardingCard } from "@/components/team/onboarding-card";
import { isComplete, readTeamSession } from "@/lib/team-session";

export const metadata: Metadata = { title: "Join your team" };

export default async function JoinPage() {
  // Already in: the app never shows this screen again until "Leave Team".
  if (isComplete(await readTeamSession())) redirect("/team");

  return (
    <OnboardingCard
      title="Join Your Team"
      subtitle="Enter the team code provided by your captain"
    >
      <AdminForm action={joinTeam} submitLabel="Join">
        <label className="field-label" htmlFor="team_code">
          Team code
        </label>
        <input
          id="team_code"
          name="team_code"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="field text-center font-mono text-lg uppercase tracking-widest"
        />
      </AdminForm>
    </OnboardingCard>
  );
}
