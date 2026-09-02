/** One cell of a StatStrip. */
export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-6 py-5">
      <p className="eyebrow text-[0.625rem] text-muted">{label}</p>
      <p className="headline mt-1.5 text-3xl text-navy sm:text-4xl">{value}</p>
    </div>
  );
}

/** Bordered strip of stat cells, hairline-divided however it wraps. */
export function StatStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
