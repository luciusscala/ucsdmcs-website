import type { Metadata } from "next";

import { createGame, deleteGame, updateGame } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { SeasonPicker } from "@/components/season-picker";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSeason, listGames, listSchools } from "@/lib/data/admin";
import { isAdminConfigured } from "@/lib/supabase-admin";
import { formatGameDate, formatTime, toDateTimeLocal } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Schedule" };

export default async function AdminSchedulePage(
  props: PageProps<"/admin/schedule">,
) {
  await requireAdmin();
  if (!isAdminConfigured()) return <SetupNotice />;

  const params = await props.searchParams;
  const [{ seasons, season }, schools] = await Promise.all([
    adminSeason("games", params.season),
    listSchools(),
  ]);
  const games = season ? await listGames(season.id) : [];

  if (!season) {
    return (
      <div className="container-page py-12">
        <p className="text-white/70">Create a season before adding games.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="headline text-3xl">Schedule · {season.year}</h1>
        <SeasonPicker seasons={seasons} selected={season} />
      </div>

      <section className="mt-6 rounded-lg bg-background p-5 text-foreground">
        <h2 className="headline text-lg">Add game</h2>

        {schools.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Add a school first — a game needs an opponent.
          </p>
        ) : (
          <AdminForm action={createGame} submitLabel="Add game" className="mt-4">
            <input type="hidden" name="season_id" value={season.id} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="game_date">Date &amp; time</label>
                <input id="game_date" name="game_date" type="datetime-local" required className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor="opponent_id">Opponent</label>
                <select id="opponent_id" name="opponent_id" required defaultValue="" className="field">
                  <option value="" disabled>Choose…</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="location">Location</label>
                <input id="location" name="location" className="field" placeholder="John Muir Field / La Jolla, CA" />
              </div>
              <div>
                <label className="field-label" htmlFor="address">Address</label>
                <input id="address" name="address" className="field" placeholder="9500 Gilman Dr, La Jolla, CA 92093" />
                <p className="mt-1 text-xs text-muted">
                  Optional. Turns the location into a map link.
                </p>
              </div>
              <div>
                <label className="field-label" htmlFor="our_score">Our score</label>
                <input id="our_score" name="our_score" type="number" min="0" className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor="their_score">Their score</label>
                <input id="their_score" name="their_score" type="number" min="0" className="field" />
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input name="is_home" type="checkbox" defaultChecked className="size-4" />
                Home game
              </label>
            </div>
          </AdminForm>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="headline text-lg">{games.length} games</h2>

        {games.map((game) => (
          <div key={game.id} className="rounded-lg bg-background p-4 text-foreground">
            <p className="text-sm">
              <span className="font-medium">{formatGameDate(game.gameDate)}</span>
              <span className="text-muted"> / {formatTime(game.gameDate)}</span>
            </p>
            <p className="headline mt-0.5 text-lg">
              {game.isHome ? "vs" : "at"} {game.opponent}
            </p>

            {/* Every field is editable inline: scores are the weekly job, but
                a misdated or misassigned fixture has to be fixable too. */}
            <AdminForm action={updateGame} submitLabel="Save" className="mt-3">
              <input type="hidden" name="id" value={game.id} />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="field-label">Date &amp; time</label>
                  <input name="game_date" type="datetime-local" required defaultValue={toDateTimeLocal(game.gameDate)} className="field" />
                </div>
                <div>
                  <label className="field-label">Opponent</label>
                  <select name="opponent_id" required defaultValue={game.opponentId ?? ""} className="field">
                    <option value="" disabled>Choose…</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                  <input name="is_home" type="checkbox" defaultChecked={game.isHome} className="size-4" />
                  Home game
                </label>
                <div>
                  <label className="field-label">Location</label>
                  <input name="location" defaultValue={game.location ?? ""} className="field" />
                </div>
                <div>
                  <label className="field-label">Address</label>
                  <input name="address" defaultValue={game.address ?? ""} className="field" placeholder="9500 Gilman Dr, La Jolla, CA 92093" />
                </div>
                <div className="flex items-end gap-3">
                  <div className="w-full">
                    <label className="field-label">Ours</label>
                    <input name="our_score" type="number" min="0" defaultValue={game.ourScore ?? ""} className="field" />
                  </div>
                  <div className="w-full">
                    <label className="field-label">Theirs</label>
                    <input name="their_score" type="number" min="0" defaultValue={game.theirScore ?? ""} className="field" />
                  </div>
                </div>
              </div>
            </AdminForm>

            {/* Its own form: a nested one is invalid HTML, and the confirm
                keeps a stray click from dropping a fixture. */}
            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <AdminForm
                action={deleteGame}
                submitLabel="Delete game"
                destructive
                confirm={`Delete ${game.isHome ? "vs" : "at"} ${game.opponent}? This cannot be undone.`}
              >
                <input type="hidden" name="id" value={game.id} />
              </AdminForm>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
