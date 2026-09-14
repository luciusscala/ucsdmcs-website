import type { Metadata } from "next";

import { createTeam } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import { listTeams } from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Teams" };

export default async function AdminTeamsPage() {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;
  const teams = await listTeams();

  return (
    <div className="container-page py-12">
      <h1 className="headline text-3xl">Teams</h1>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add team</h2>

        <AdminForm action={createTeam} submitLabel="Add team" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="name">Name</label>
              <input id="name" name="name" required className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="data_alias">Standings name</label>
              <input id="data_alias" name="data_alias" className="field" placeholder="Loyola Marymount" />
              <p className="mt-1 text-xs text-muted">
                Optional. Only when SportsEngine spells the name differently.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="logo">Logo</label>
              <input id="logo" name="logo" type="file" accept="image/*" className="field" />
            </div>
          </div>
        </AdminForm>
      </section>

      <section className="mt-8 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">{teams.length} teams</h2>
        <ul className="mt-3 divide-y divide-border">
          {teams.map((team) => (
            <li key={team.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {team.name}
                {team.data_alias && (
                  <span className="text-muted"> ({team.data_alias})</span>
                )}
              </span>
              <span className="text-muted">{team.logo_path ?? "no logo"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
