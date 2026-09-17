import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { savePhone } from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { OnboardingCard } from "@/components/team/onboarding-card";
import { isComplete, readTeamSession } from "@/lib/team-session";

export const metadata: Metadata = { title: "Your phone number" };

export default async function PhoneStepPage() {
  const session = await readTeamSession();
  if (!session) redirect("/team/join");
  if (!session.rosterId) redirect("/team/join/roster");
  if (isComplete(session)) redirect("/team");

  return (
    <OnboardingCard
      title="Your Phone Number"
      subtitle="Used for team notifications and reminders"
    >
      <AdminForm action={savePhone} submitLabel="Continue">
        <label className="field-label" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required
          minLength={10}
          placeholder="5551234567"
          className="field text-center text-lg"
        />
        <p className="mt-3 text-xs text-muted">
          By continuing you agree to receive team SMS reminders. Message and
          data rates may apply; reply STOP to opt out. See the{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      </AdminForm>
    </OnboardingCard>
  );
}
