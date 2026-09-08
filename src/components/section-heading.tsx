/**
 * A heading for a section inside a page's card, below the `h1`. Quieter than
 * the page title and ruled off, so a long single card still reads as parts.
 */
export function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mt-8 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </h2>
  );
}
