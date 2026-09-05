import type { Metadata } from "next";
import Link from "next/link";

import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import { listGames, listRoster, listSeasons } from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHome() {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const seasons = await listSeasons();
  const current = seasons.find((season) => season.is_current) ?? seasons[0];

  const [roster, games] = current
    ? await Promise.all([listRoster(current.id), listGames(current.id)])
    : [[], []];

  const cards = [
    { href: "/admin/roster", label: "Roster", detail: `${roster.length} players` },
    { href: "/admin/schedule", label: "Schedule", detail: `${games.length} games` },
  ];

  return (
    <div className="container-page py-12">
      <h1 className="headline text-3xl">
        {current ? `${current.year} Season` : "No seasons yet"}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg bg-background p-5 text-foreground transition hover:bg-surface"
          >
            <p className="headline text-xl">{card.label}</p>
            <p className="mt-1 text-sm text-muted">{card.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
