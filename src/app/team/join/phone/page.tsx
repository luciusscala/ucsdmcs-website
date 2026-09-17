import type { Metadata } from "next";
import Link from "next/link";
import { savePhone, skipPhone } from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { OnboardingCard } from "@/components/team/onboarding-card";
import { teamRedirect } from "@/lib/team-path";
import { isComplete, readTeamSession } from "@/lib/team-session";

export const metadata: Metadata = { title: "Your phone number" };

export default async function PhoneStepPage() {
  const session = await readTeamSession();
  if (!session) return teamRedirect("/join");
  if (!session.rosterId) return teamRedirect("/join/roster");
  if (isComplete(session)) return teamRedirect("");

  return (
    <OnboardingCard
      title="Your Phone Number"
      subtitle="Optional — it's how captains send you reminders"
    >
      <AdminForm action={savePhone} submitLabel="Continue">
        <label className="field-label" htmlFor="phone">
          Phone <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="5551234567"
          className="field text-center text-lg"
        />
        <p className="mt-3 text-xs text-muted">
          Leave it blank and you&rsquo;ll see the schedule as usual, just without the
          text reminders. Giving a number opts you in to team SMS: message and
          data rates may apply, reply STOP to opt out, and you can remove it in
          Settings at any time. See the{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      </AdminForm>

      {/* Its own form: a second button inside the one above would post the
          number the player may have started typing. */}
      <form action={skipPhone} className="mt-4 text-center">
        <button
          type="submit"
          className="text-sm text-muted underline underline-offset-4 transition hover:text-foreground"
        >
          Skip for now
        </button>
      </form>
    </OnboardingCard>
  );
}
