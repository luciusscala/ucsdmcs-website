import type { Metadata } from "next";

import {
  disableCaptain,
  leaveTeamConfirmed,
  unlockCaptain,
  updateHometown,
} from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentSeason, getRoster } from "@/lib/data/team";
import { requireTeamSession } from "@/lib/team-session";

export const metadata: Metadata = { title: "Team Settings" };

export default async function TeamSettingsPage() {
  const session = await requireTeamSession();

  const season = await getCurrentSeason();
  const me = season
    ? (await getRoster(season.id)).find((member) => member.rosterId === session.rosterId)
    : undefined;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <h1 className="headline text-xl sm:text-2xl">Settings</h1>

        {me && (
          <>
            <SectionHeading>Profile</SectionHeading>
            <dl className="mt-3 divide-y divide-border text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-muted">Name</dt>
                <dd>{me.name}</dd>
              </div>
              {me.number !== null && (
                <div className="flex justify-between py-2.5">
                  <dt className="text-muted">Number</dt>
                  <dd>#{me.number}</dd>
                </div>
              )}
              {me.phone && (
                <div className="flex justify-between py-2.5">
                  <dt className="text-muted">Phone</dt>
                  <dd className="tabular-nums">{me.phone}</dd>
                </div>
              )}
            </dl>

            <AdminForm action={updateHometown} submitLabel="Save Changes" className="mt-2">
              <label className="field-label" htmlFor="hometown">
                Hometown
              </label>
              <input
                id="hometown"
                name="hometown"
                defaultValue={me.hometown ?? ""}
                placeholder="Add hometown"
                className="field"
              />
            </AdminForm>
          </>
        )}

        <SectionHeading>Admin Access</SectionHeading>
        {session.captain ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="flex items-center gap-2">
              <span aria-hidden className="text-going">
                ✓
              </span>
              Admin Mode Active
            </p>
            <form action={disableCaptain}>
              <button type="submit" className="text-blue underline underline-offset-4">
                Disable Admin Mode
              </button>
            </form>
          </div>
        ) : (
          <AdminForm action={unlockCaptain} submitLabel="Unlock Admin" className="mt-3">
            <label className="field-label" htmlFor="admin_code">
              Admin code
            </label>
            <input
              id="admin_code"
              name="admin_code"
              type="password"
              required
              autoComplete="off"
              autoCapitalize="none"
              className="field"
            />
          </AdminForm>
        )}

        <SectionHeading>Account</SectionHeading>
        <div className="mt-3">
          <AdminForm
            action={leaveTeamConfirmed}
            submitLabel="Leave Team"
            destructive
            confirm="Leave the team on this device? You can rejoin with the team code."
          >
            <p className="mb-3 text-sm text-muted">
              Forgets your team and name in this browser. Nothing on the roster changes.
            </p>
          </AdminForm>
        </div>
      </div>
    </div>
  );
}
