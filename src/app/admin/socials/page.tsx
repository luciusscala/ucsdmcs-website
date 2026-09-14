import type { Metadata } from "next";

import {
  createSocialEvent,
  deleteSocialEvent,
  updateSocialEvent,
} from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { SeasonPicker } from "@/components/season-picker";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSeason, listSocialEvents } from "@/lib/data/admin";
import { formatGameDate, formatTime, toDateTimeLocal } from "@/lib/format";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Socials" };

export default async function AdminSocialsPage(
  props: PageProps<"/admin/socials">,
) {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const params = await props.searchParams;
  const { seasons, season } = await adminSeason("social_events", params.season);
  const socials = season ? await listSocialEvents(season.id) : [];

  if (!season) {
    return (
      <div className="container-page py-12">
        <p className="text-white/70">Create a season before adding social events.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="headline text-3xl">Socials · {season.year}</h1>
        <SeasonPicker seasons={seasons} selected={season} />
      </div>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add social event</h2>

        <AdminForm action={createSocialEvent} submitLabel="Add social" className="mt-4">
          <input type="hidden" name="season_id" value={season.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="name">Name</label>
              <input id="name" name="name" required className="field" placeholder="End of season banquet" />
            </div>
            <div>
              <label className="field-label" htmlFor="date">Date &amp; time</label>
              <input id="date" name="date" type="datetime-local" required className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="description">Description</label>
              <input id="description" name="description" className="field" placeholder="Where, what to bring, who's invited" />
            </div>
          </div>
        </AdminForm>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="headline text-lg">{socials.length} social events</h2>

        {socials.map((social) => (
          <div key={social.id} className="rounded-lg bg-background p-4 text-foreground">
            <p className="text-sm">
              <span className="font-medium">{formatGameDate(social.date)}</span>
              <span className="text-muted"> / {formatTime(social.date)}</span>
            </p>
            <p className="headline mt-0.5 text-lg">{social.name}</p>

            <AdminForm action={updateSocialEvent} submitLabel="Save" className="mt-3">
              <input type="hidden" name="id" value={social.id} />
              <input type="hidden" name="event_id" value={social.eventId} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label">Name</label>
                  <input name="name" required defaultValue={social.name} className="field" />
                </div>
                <div>
                  <label className="field-label">Date &amp; time</label>
                  <input name="date" type="datetime-local" required defaultValue={toDateTimeLocal(social.date)} className="field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Description</label>
                  <input name="description" defaultValue={social.description ?? ""} className="field" />
                </div>
              </div>
            </AdminForm>

            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <AdminForm
                action={deleteSocialEvent}
                submitLabel="Delete social"
                destructive
                confirm={`Delete ${social.name}? This cannot be undone.`}
              >
                <input type="hidden" name="id" value={social.id} />
                <input type="hidden" name="event_id" value={social.eventId} />
              </AdminForm>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
