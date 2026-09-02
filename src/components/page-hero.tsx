export function PageHero({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Optional right-hand block, e.g. a compact season summary. */
  aside?: React.ReactNode;
}) {
  return (
    <section className="bg-navy text-white">
      <div className="container-page grid gap-8 py-11 sm:py-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow text-yellow">{eyebrow}</p>
          <h1 className="headline mt-3 text-4xl sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              {description}
            </p>
          )}
        </div>
        {aside && <div className="lg:justify-self-end">{aside}</div>}
      </div>
      <div className="h-1.5 bg-yellow" />
    </section>
  );
}

/** Label/value pairs for a PageHero aside. */
export function HeroStats({
  stats,
}: {
  stats: { label: string; value: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4 lg:gap-x-8">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="eyebrow text-[0.625rem] text-white/50">
            {stat.label}
          </dt>
          <dd className="headline mt-1 text-2xl text-white">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
