import type { Metadata } from "next";

import {
  createTournament,
  deleteTournament,
  updateTournament,
} from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { SeasonPicker } from "@/components/season-picker";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSeason, listFields, listTournaments } from "@/lib/data/admin";
import { formatGameDate, formatTime, toDateTimeLocal } from "@/lib/format";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Tournaments" };

export default async function AdminTournamentsPage(
  props: PageProps<"/admin/tournaments">,
) {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const params = await props.searchParams;
  const [{ seasons, season }, fields] = await Promise.all([
    adminSeason("tournaments", params.season),
    listFields(),
  ]);
  const tournaments = season ? await listTournaments(season.id) : [];

  if (!season) {
    return (
      <div className="container-page py-12">
        <p className="text-white/70">Create a season before adding tournaments.</p>
      </div>
    );
  }

  // Optional: an away tournament is usually somewhere we have no field row
  // for, which is what the free-text location is for.
  const fieldOptions = (
    <>
      <option value="">None</option>
      {fields.map((field) => (
        <option key={field.id} value={field.id}>{field.label}</option>
      ))}
    </>
  );

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="headline text-3xl">Tournaments · {season.year}</h1>
        <SeasonPicker seasons={seasons} selected={season} />
      </div>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add tournament</h2>

        <AdminForm action={createTournament} submitLabel="Add tournament" className="mt-4">
          <input type="hidden" name="season_id" value={season.id} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="name">Name</label>
              <input id="name" name="name" required className="field" placeholder="SoCal Invitational" />
            </div>
            <div>
              <label className="field-label" htmlFor="date">Start date &amp; time</label>
              <input id="date" name="date" type="datetime-local" required className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="website_link">Website</label>
              <input id="website_link" name="website_link" type="url" className="field" placeholder="https://" />
            </div>
            <div>
              <label className="field-label" htmlFor="location">Location</label>
              <input id="location" name="location" className="field" placeholder="Santa Barbara, CA" />
            </div>
            <div>
              <label className="field-label" htmlFor="field_id">Field</label>
              <select id="field_id" name="field_id" defaultValue="" className="field">
                {fieldOptions}
              </select>
            </div>
          </div>
        </AdminForm>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="headline text-lg">{tournaments.length} tournaments</h2>

        {tournaments.map((tournament) => (
          <div key={tournament.id} className="rounded-lg bg-background p-4 text-foreground">
            <p className="text-sm">
              <span className="font-medium">{formatGameDate(tournament.date)}</span>
              <span className="text-muted"> / {formatTime(tournament.date)}</span>
            </p>
            <p className="headline mt-0.5 text-lg">{tournament.name}</p>

            <AdminForm action={updateTournament} submitLabel="Save" className="mt-3">
              <input type="hidden" name="id" value={tournament.id} />
              <input type="hidden" name="event_id" value={tournament.eventId} />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="field-label">Name</label>
                  <input name="name" required defaultValue={tournament.name} className="field" />
                </div>
                <div>
                  <label className="field-label">Start date &amp; time</label>
                  <input name="date" type="datetime-local" required defaultValue={toDateTimeLocal(tournament.date)} className="field" />
                </div>
                <div>
                  <label className="field-label">Website</label>
                  <input name="website_link" type="url" defaultValue={tournament.websiteLink ?? ""} className="field" placeholder="https://" />
                </div>
                <div>
                  <label className="field-label">Location</label>
                  <input name="location" defaultValue={tournament.location ?? ""} className="field" />
                </div>
                <div>
                  <label className="field-label">Field</label>
                  <select name="field_id" defaultValue={tournament.fieldId ?? ""} className="field">
                    {fieldOptions}
                  </select>
                </div>
              </div>
            </AdminForm>

            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <AdminForm
                action={deleteTournament}
                submitLabel="Delete tournament"
                destructive
                confirm={`Delete ${tournament.name}? This cannot be undone.`}
              >
                <input type="hidden" name="id" value={tournament.id} />
                <input type="hidden" name="event_id" value={tournament.eventId} />
              </AdminForm>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
