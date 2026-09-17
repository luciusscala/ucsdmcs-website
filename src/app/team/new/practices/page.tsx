import type { Metadata } from "next";

import { FormCard } from "@/components/team/form-card";
import { RepeatingPracticeForm } from "@/components/team/repeating-practice-form";
import { listFields } from "@/lib/data/admin";
import { teamBase } from "@/lib/team-path";
import { requireCaptain } from "@/lib/team-session";

export const metadata: Metadata = { title: "Repeating Practices" };

export default async function NewRepeatingPracticesPage() {
  await requireCaptain();
  const fields = await listFields();

  return (
    <FormCard title="Repeating Practices" cancelHref={(await teamBase()) || "/"}>
      <RepeatingPracticeForm fields={fields} />
    </FormCard>
  );
}
