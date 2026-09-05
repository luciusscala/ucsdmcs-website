import type { Metadata } from "next";

import { createSchool } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import { listSchools } from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Schools" };

export default async function AdminSchoolsPage() {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;
  const schools = await listSchools();

  return (
    <div className="container-page py-12">
      <h1 className="headline text-3xl">Schools</h1>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add school</h2>

        <AdminForm action={createSchool} submitLabel="Add school" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="name">Name</label>
              <input id="name" name="name" required className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="logo">Logo</label>
              <input id="logo" name="logo" type="file" accept="image/*" className="field" />
            </div>
          </div>
        </AdminForm>
      </section>

      <section className="mt-8 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">{schools.length} schools</h2>
        <ul className="mt-3 divide-y divide-border">
          {schools.map((school) => (
            <li key={school.id} className="flex items-center justify-between py-2 text-sm">
              <span>{school.name}</span>
              <span className="text-muted">{school.logo_path ?? "no logo"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
