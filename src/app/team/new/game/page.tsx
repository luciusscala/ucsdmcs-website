import type { Metadata } from "next";

import { createGame } from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { GameFields } from "@/components/team/event-fields";
import { FormCard } from "@/components/team/form-card";
import { listFields, listTeams } from "@/lib/data/admin";
import { teamBase } from "@/lib/team-path";
import { requireCaptain } from "@/lib/team-session";

export const metadata: Metadata = { title: "Add Game" };

export default async function NewGamePage() {
  await requireCaptain();
  const [fields, teams] = await Promise.all([listFields(), listTeams()]);

  return (
    <FormCard title="Add Game" cancelHref={(await teamBase()) || "/"}>
      <AdminForm action={createGame} submitLabel="Add">
        <GameFields fields={fields} teams={teams} />
      </AdminForm>
    </FormCard>
  );
}
