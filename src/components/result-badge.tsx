import type { MatchOutcome } from "@/lib/data/schedule";

const styles: Record<MatchOutcome, string> = {
  W: "bg-win text-white",
  D: "bg-draw text-white",
  L: "bg-loss text-white",
};

export function ResultBadge({
  outcome,
  className = "",
}: {
  outcome: MatchOutcome;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${styles[outcome]} ${className}`}
      title={outcome === "W" ? "Win" : outcome === "L" ? "Loss" : "Draw"}
    >
      {outcome}
    </span>
  );
}
