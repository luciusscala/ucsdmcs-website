/**
 * A boxed list of players — "#7  Ada Chen" per row — used for each response
 * group on the event page and for the reminder's roster. Number column keeps
 * a fixed width so names line up whether or not a player has one.
 */
export function MemberList({
  members,
  muted = false,
  trailing,
}: {
  members: { rosterId: string; name: string; number: number | null }[];
  /** Grey names, for the "No Response" group. */
  muted?: boolean;
  /** Optional per-row suffix, keyed by roster id. */
  trailing?: (rosterId: string) => React.ReactNode;
}) {
  return (
    <ul className="divide-y divide-border rounded-lg bg-surface">
      {members.map((member) => (
        <li
          key={member.rosterId}
          className={`flex items-center gap-3 px-3 py-2 text-sm ${muted ? "text-muted" : ""}`}
        >
          <span className="w-9 shrink-0 text-right font-mono text-xs font-semibold text-muted">
            {member.number !== null ? `#${member.number}` : ""}
          </span>
          <span className="min-w-0 flex-1 truncate">{member.name}</span>
          {trailing?.(member.rosterId)}
        </li>
      ))}
    </ul>
  );
}
