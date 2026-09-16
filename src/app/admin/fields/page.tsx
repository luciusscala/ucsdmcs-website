import type { Metadata } from "next";

import { createField, deleteField, updateField } from "@/app/admin/actions";
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
                What the public schedule shows for the venue.
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

      <section className="mt-8 space-y-3">
        <h2 className="headline text-lg">{fields.length} fields</h2>

        {fields.map((field) => (
          <div key={field.id} className="rounded-lg bg-background p-4 text-foreground">
            <p className="headline text-lg">{field.label}</p>
            <p className="text-sm text-muted">{field.picture_path ?? "no photo"}</p>

            <AdminForm action={updateField} submitLabel="Save" className="mt-3">
              <input type="hidden" name="id" value={field.id} />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="field-label">Name</label>
                  <input name="name" required defaultValue={field.name} className="field" />
                </div>
                <div>
                  <label className="field-label">Area</label>
                  <input name="area" defaultValue={field.area ?? ""} className="field" placeholder="La Jolla" />
                </div>
                <div>
                  <label className="field-label">Address</label>
                  <input name="maps_address" defaultValue={field.maps_address ?? ""} className="field" />
                </div>
                <div>
                  <label className="field-label">Recommended parking</label>
                  <input name="recommended_parking" defaultValue={field.recommended_parking ?? ""} className="field" />
                </div>
                <div>
                  <label className="field-label">Photo</label>
                  <input name="picture" type="file" accept="image/*" className="field" />
                  <p className="mt-1 text-xs text-muted">Leave empty to keep the current photo.</p>
                </div>
              </div>
            </AdminForm>

            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <AdminForm
                action={deleteField}
                submitLabel="Delete field"
                destructive
                confirm={`Delete ${field.name}? This cannot be undone.`}
              >
                <input type="hidden" name="id" value={field.id} />
              </AdminForm>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
