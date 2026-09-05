import type { Season } from "@/lib/data/season";

/**
 * Plain GET form, so switching seasons needs no JavaScript. Submits to the
 * current path, which keeps one component usable from both pages.
 */
export function SeasonPicker({
  seasons,
  selected,
}: {
  seasons: Season[];
  selected: Season | null;
}) {
  if (seasons.length === 0) return null;

  return (
    <form method="get" className="ml-auto flex items-stretch">
      <label htmlFor="season" className="sr-only">
        Season
      </label>
      <select
        id="season"
        name="season"
        defaultValue={selected?.year ?? seasons[0].year}
        className="border border-border-strong bg-background px-3 py-1.5 text-sm text-foreground"
      >
        {seasons.map((option) => (
          <option key={option.id} value={option.year}>
            {option.year}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-navy px-3 py-1.5 text-sm font-semibold text-yellow transition hover:opacity-90"
      >
        Go
      </button>
    </form>
  );
}
