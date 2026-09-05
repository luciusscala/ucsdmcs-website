import type { Metadata } from "next";

import { createPlayer, updatePlayer } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import { listRoster, listSeasons } from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Roster" };

const CLASSES = ["Freshman", "Sophomore", "Junior", "Senior"];
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

export default async function AdminRosterPage() {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const seasons = await listSeasons();
  const season = seasons.find((s) => s.is_current) ?? seasons[0];
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
      <h1 className="headline text-3xl">Roster · {season.year}</h1>

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
              <input type="hidden" name="player_id" value={entry.playerId} />
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
          </div>
        ))}
      </section>
    </div>
  );
}
