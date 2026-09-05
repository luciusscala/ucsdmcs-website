import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { login } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Admin login" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-sm rounded-lg bg-background p-6 text-foreground">
        <h1 className="headline text-2xl">Admin</h1>

        <AdminForm action={login} submitLabel="Sign in" className="mt-4">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
          />
        </AdminForm>
      </div>
    </div>
  );
}
