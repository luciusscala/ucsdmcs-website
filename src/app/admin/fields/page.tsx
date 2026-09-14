import type { Metadata } from "next";

import { createField } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import { listFields } from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin · Fields" };

export default async function AdminFieldsPage() {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;
  const fields = await listFields();

  return (
    <div className="container-page py-12">
      <h1 className="headline text-3xl">Fields</h1>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add field</h2>

        <AdminForm action={createField} submitLabel="Add field" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="name">Name</label>
              <input id="name" name="name" required className="field" placeholder="John Muir Field" />
            </div>
            <div>
              <label className="field-label" htmlFor="area">Area</label>
              <input id="area" name="area" className="field" placeholder="La Jolla" />
              <p className="mt-1 text-xs text-muted">
                Shown after the name on the schedule: &ldquo;John Muir Field, La Jolla&rdquo;.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="maps_address">Address</label>
              <input id="maps_address" name="maps_address" className="field" placeholder="9500 Gilman Dr, La Jolla, CA 92093" />
              <p className="mt-1 text-xs text-muted">
                Optional. Turns the field into a directions link.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="recommended_parking">Recommended parking</label>
              <input id="recommended_parking" name="recommended_parking" className="field" placeholder="Hopkins Parking Structure" />
            </div>
            <div>
              <label className="field-label" htmlFor="picture">Photo</label>
              <input id="picture" name="picture" type="file" accept="image/*" className="field" />
            </div>
          </div>
        </AdminForm>
      </section>

      <section className="mt-8 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">{fields.length} fields</h2>
        <ul className="mt-3 divide-y divide-border">
          {fields.map((field) => (
            <li key={field.id} className="py-2 text-sm">
              <p className="font-medium">{field.label}</p>
              <p className="text-muted">
                {[
                  field.maps_address ?? "no address",
                  field.recommended_parking && `park: ${field.recommended_parking}`,
                  field.picture_path ?? "no photo",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
