import type { Metadata } from "next";

import { createPractice, deletePractice, updatePractice } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { SeasonPicker } from "@/components/season-picker";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSeason, listFields, listPractices } from "@/lib/data/admin";
import { formatGameDate, formatTime, toDateTimeLocal } from "@/lib/format";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Practices" };

export default async function AdminPracticesPage(
  props: PageProps<"/admin/practices">,
) {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const params = await props.searchParams;
  const [{ seasons, season }, fields] = await Promise.all([
    adminSeason("practices", params.season),
    listFields(),
  ]);
  const practices = season ? await listPractices(season.id) : [];

  if (!season) {
    return (
      <div className="container-page py-12">
        <p className="text-white/70">Create a season before adding practices.</p>
      </div>
    );
  }

  const fieldOptions = (
    <>
      <option value="" disabled>Choose…</option>
      {fields.map((field) => (
        <option key={field.id} value={field.id}>{field.label}</option>
      ))}
    </>
  );

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="headline text-3xl">Practices · {season.year}</h1>
        <SeasonPicker seasons={seasons} selected={season} />
      </div>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add practice</h2>

        {fields.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Add a field first — a practice needs somewhere to happen.
          </p>
        ) : (
          <AdminForm action={createPractice} submitLabel="Add practice" className="mt-4">
            <input type="hidden" name="season_id" value={season.id} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="date">Date &amp; time</label>
                <input id="date" name="date" type="datetime-local" required className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor="field_id">Field</label>
                <select id="field_id" name="field_id" required defaultValue="" className="field">
                  {fieldOptions}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="film_link">Film link</label>
                <input id="film_link" name="film_link" type="url" className="field" placeholder="https://" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="field-label" htmlFor="notes">Notes</label>
                <input id="notes" name="notes" className="field" placeholder="Bring both kits" />
              </div>
            </div>
          </AdminForm>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="headline text-lg">{practices.length} practices</h2>

        {practices.map((practice) => (
          <div key={practice.id} className="rounded-lg bg-background p-4 text-foreground">
            <p className="text-sm">
              <span className="font-medium">{formatGameDate(practice.date)}</span>
              <span className="text-muted"> / {formatTime(practice.date)}</span>
            </p>
            <p className="headline mt-0.5 text-lg">{practice.field}</p>

            <AdminForm action={updatePractice} submitLabel="Save" className="mt-3">
              <input type="hidden" name="id" value={practice.id} />
              <input type="hidden" name="event_id" value={practice.eventId} />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="field-label">Date &amp; time</label>
                  <input name="date" type="datetime-local" required defaultValue={toDateTimeLocal(practice.date)} className="field" />
                </div>
                <div>
                  <label className="field-label">Field</label>
                  <select name="field_id" required defaultValue={practice.fieldId} className="field">
                    {fieldOptions}
                  </select>
                </div>
                <div>
                  <label className="field-label">Film link</label>
                  <input name="film_link" type="url" defaultValue={practice.filmLink ?? ""} className="field" placeholder="https://" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="field-label">Notes</label>
                  <input name="notes" defaultValue={practice.notes ?? ""} className="field" />
                </div>
              </div>
            </AdminForm>

            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <AdminForm
                action={deletePractice}
                submitLabel="Delete practice"
                destructive
                confirm={`Delete the ${formatGameDate(practice.date)} practice? This cannot be undone.`}
              >
                <input type="hidden" name="id" value={practice.id} />
                <input type="hidden" name="event_id" value={practice.eventId} />
              </AdminForm>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
