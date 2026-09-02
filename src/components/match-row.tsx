import { ResultBadge } from "@/components/result-badge";
import { type Match, outcomeOf } from "@/lib/data/schedule";
import {
  formatDayNumber,
  formatMatchTime,
  formatMonthShort,
} from "@/lib/format";

export function MatchRow({ match }: { match: Match }) {
  const outcome = outcomeOf(match);

  return (
    <li className="flex items-center gap-4 border-b border-border py-5 last:border-b-0 sm:gap-6">
      <div className="flex w-14 shrink-0 flex-col items-center rounded-md border border-border bg-surface py-2">
        <span className="eyebrow text-[0.6875rem] text-blue">
          {formatMonthShort(match.date)}
        </span>
        <span className="headline text-2xl text-navy">
          {formatDayNumber(match.date)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[0.6875rem] text-muted">
          {match.home ? "Home" : "Away"} · {match.competition}
        </p>
        <p className="headline mt-1 truncate text-xl text-navy sm:text-2xl">
          {match.home ? "vs" : "at"} {match.opponent}
        </p>
        <p className="mt-1 truncate text-sm text-muted">
          {match.venue}
          {match.note ? ` · ${match.note}` : ""}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {match.status === "final" && match.score && outcome ? (
          <div className="flex items-center gap-3">
            <span className="headline text-2xl text-navy sm:text-3xl">
              {match.score.us}–{match.score.them}
            </span>
            <ResultBadge outcome={outcome} />
          </div>
        ) : (
          <span className="headline text-xl text-navy sm:text-2xl">
            {formatMatchTime(match.date)}
          </span>
        )}
      </div>
    </li>
  );
}
