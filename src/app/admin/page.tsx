import type { Metadata } from "next";
import Link from "next/link";

import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import {
  listGames,
  listPractices,
  listRoster,
  listSeasons,
  listSocialEvents,
  listTournaments,
} from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHome() {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const seasons = await listSeasons();
  const current = seasons.find((season) => season.is_current) ?? seasons[0];

  const [roster, games, practices, socials, tournaments] = current
    ? await Promise.all([
        listRoster(current.id),
        listGames(current.id),
        listPractices(current.id),
        listSocialEvents(current.id),
        listTournaments(current.id),
      ])
    : [[], [], [], [], []];

  const cards = [
    { href: "/admin/roster", label: "Roster", detail: `${roster.length} players` },
    { href: "/admin/schedule", label: "Schedule", detail: `${games.length} games` },
    { href: "/admin/practices", label: "Practices", detail: `${practices.length} practices` },
    { href: "/admin/socials", label: "Socials", detail: `${socials.length} social events` },
    { href: "/admin/tournaments", label: "Tournaments", detail: `${tournaments.length} tournaments` },
  ];

  return (
    <div className="container-page py-12">
      <h1 className="headline text-3xl">
        {current ? `${current.year} Season` : "No seasons yet"}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
