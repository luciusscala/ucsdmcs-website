import type { Metadata } from "next";

import { createPlayer, deletePlayer, updatePlayer } from "@/app/admin/actions";
import { SeasonPicker } from "@/components/season-picker";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSeason, listRoster } from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Roster" };

const CLASSES = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

function Select({
  name,
  options,
  defaultValue,
  required,
}: {
  name: string;
  options: string[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} required={required} className="field">
      <option value="" disabled>
        Choose…
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default async function AdminRosterPage(
  props: PageProps<"/admin/roster">,
) {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const params = await props.searchParams;
  const { seasons, season } = await adminSeason("roster", params.season);
  const roster = season ? await listRoster(season.id) : [];

  if (!season) {
    return (
      <div className="container-page py-12">
        <p className="text-white/70">Create a season before adding players.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="headline text-3xl">Roster · {season.year}</h1>
        <SeasonPicker seasons={seasons} selected={season} />
      </div>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add player</h2>

        <AdminForm action={createPlayer} submitLabel="Add player" className="mt-4">
          <input type="hidden" name="season_id" value={season.id} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="name">Name</label>
              <input id="name" name="name" required className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="hometown">Hometown</label>
              <input id="hometown" name="hometown" className="field" placeholder="San Diego, CA" />
            </div>
            <div>
              <label className="field-label" htmlFor="number">Number</label>
              <input id="number" name="number" type="number" min="0" className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="position">Position</label>
              <Select name="position" options={POSITIONS} required />
            </div>
            <div>
              <label className="field-label" htmlFor="class">Class</label>
              <Select name="class" options={CLASSES} required />
            </div>
            <div>
              <label className="field-label" htmlFor="picture">Photo</label>
              <input id="picture" name="picture" type="file" accept="image/*" className="field" />
            </div>
          </div>
        </AdminForm>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="headline text-lg">{roster.length} players</h2>

        {roster.map((entry) => (
          <div key={entry.entryId} className="rounded-lg bg-background p-4 text-foreground">
            <AdminForm action={updatePlayer} submitLabel="Save">
              <input type="hidden" name="person_id" value={entry.personId} />
              <input type="hidden" name="entry_id" value={entry.entryId} />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-2">
                  <label className="field-label">Name</label>
                  <input name="name" defaultValue={entry.name} required className="field" />
                </div>
                <div>
                  <label className="field-label">Number</label>
                  <input name="number" type="number" min="0" defaultValue={entry.number ?? ""} className="field" />
                </div>
                <div>
                  <label className="field-label">Position</label>
                  <Select name="position" options={POSITIONS} defaultValue={entry.position} required />
                </div>
                <div>
                  <label className="field-label">Class</label>
                  <Select name="class" options={CLASSES} defaultValue={entry.year} required />
                </div>
                <div>
                  <label className="field-label">Hometown</label>
                  <input name="hometown" defaultValue={entry.hometown ?? ""} className="field" />
                </div>
              </div>

              <div className="mt-3">
                <label className="field-label">
                  Replace photo {entry.picturePath ? `(current: ${entry.picturePath})` : "(none yet)"}
                </label>
                <input name="picture" type="file" accept="image/*" className="field" />
              </div>
            </AdminForm>

            {/* Its own form: a nested one is invalid HTML, and the confirm
                keeps a stray click from dropping a player. */}
            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <AdminForm
                action={deletePlayer}
                submitLabel="Remove from roster"
                destructive
                confirm={`Remove ${entry.name} from the ${season.year} roster? This cannot be undone.`}
              >
                <input type="hidden" name="person_id" value={entry.personId} />
                <input type="hidden" name="entry_id" value={entry.entryId} />
              </AdminForm>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
