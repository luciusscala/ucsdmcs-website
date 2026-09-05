import { headshotUrl, supabase } from "@/lib/supabase";

/** Mirrors the `players` table. */
type PlayerRow = {
  id: string;
  name: string;
  class: string;
  position: string;
  number: number | null;
  hometown: string | null;
  headshot_path: string | null;
};

export type Player = {
  id: string;
  name: string;
  /** Freshman | Sophomore | Junior | Senior, per the valid_class constraint. */
  year: string;
  position: string;
  number: number | null;
  hometown: string | null;
  /** Already resolved to a public URL; null when the player has no headshot. */
  headshot: string | null;
};

/**
 * Sections run back-to-front the way a lineup is read. Goalkeeper is listed
 * ahead of the current valid_position constraint, which omits it — any
 * position not named here still renders, in a trailing group.
 */
const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

function toPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    year: row.class,
    position: row.position,
    number: row.number,
    hometown: row.hometown,
    headshot: headshotUrl(row.headshot_path),
  };
}

/** Every player, by squad number with unnumbered players last, then by name. */
export async function getPlayers(): Promise<Player[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("players")
    .select("id, name, class, position, number, hometown, headshot_path")
    .order("number", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load players: ${error.message}`);

  return (data as unknown as PlayerRow[]).map(toPlayer);
}

/** Groups into position sections, keeping any unrecognised position visible. */
export function groupByPosition(players: Player[]) {
  const groups = new Map<string, Player[]>();

  for (const player of players) {
    const group = groups.get(player.position);
    if (group) group.push(player);
    else groups.set(player.position, [player]);
  }

  const rank = (position: string) => {
    const index = POSITION_ORDER.indexOf(position);
    return index === -1 ? POSITION_ORDER.length : index;
  };

  return [...groups.entries()]
    .map(([position, squad]) => ({ position, players: squad }))
    .sort((a, b) => rank(a.position) - rank(b.position) || a.position.localeCompare(b.position));
}

/** Pluralised section heading: "Defenders", "Midfielders". */
export const positionLabel = (position: string) =>
  position.endsWith("s") ? position : `${position}s`;

/** "AC" from "Ada Chen" — the headshot placeholder. */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
