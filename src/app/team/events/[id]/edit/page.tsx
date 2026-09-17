import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { updateGame, updatePractice } from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { GameFields, PracticeFields } from "@/components/team/event-fields";
import { FormCard } from "@/components/team/form-card";
import { listFields, listTeams } from "@/lib/data/admin";
import { getEvent } from "@/lib/data/team";
import { toDateTimeLocal } from "@/lib/format";
import { requireCaptain } from "@/lib/team-session";

export const metadata: Metadata = { title: "Edit Event" };

/** Practices and games only, as in the app; socials and tournaments are
 *  edited on the admin dashboard. */
export default async function EditEventPage(
  props: PageProps<"/team/events/[id]/edit">,
) {
  await requireCaptain();
  const { id } = await props.params;

  const event = await getEvent(id);
  if (!event) notFound();

  const back = `/team/events/${event.id}`;
  const date = toDateTimeLocal(event.date);

  if (event.type === "practice") {
    const fields = await listFields();
    return (
      <FormCard title="Edit Practice" cancelHref={back}>
        <AdminForm action={updatePractice} submitLabel="Save">
          <input type="hidden" name="event_id" value={event.id} />
          <PracticeFields
            fields={fields}
            initial={{
              date,
              fieldId: event.practice?.fieldId ?? null,
              notes: event.practice?.notes ?? null,
            }}
          />
        </AdminForm>
      </FormCard>
    );
  }

  if (event.type === "game") {
    const [fields, teams] = await Promise.all([listFields(), listTeams()]);
    return (
      <FormCard title="Edit Game" cancelHref={back}>
        <AdminForm action={updateGame} submitLabel="Save">
          <input type="hidden" name="event_id" value={event.id} />
          <GameFields
            fields={fields}
            teams={teams}
            initial={{
              date,
              opponentId: event.game?.opponentId ?? null,
              fieldId: event.game?.fieldId ?? null,
              isHome: event.game?.isHome ?? true,
            }}
          />
        </AdminForm>
      </FormCard>
    );
  }

  redirect(back);
}
