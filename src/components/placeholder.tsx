/** A planned section that has no content yet. Says so plainly, no filler copy. */
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-xl bg-background p-4 text-foreground sm:p-6">
        <h1 className="headline text-xl sm:text-2xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Coming soon.</p>
      </div>
    </div>
  );
}
