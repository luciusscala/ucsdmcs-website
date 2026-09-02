import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6 border-b-2 border-navy pb-3">
      <div>
        {eyebrow && <p className="eyebrow text-blue">{eyebrow}</p>}
        <h2 className="headline mt-1.5 text-3xl text-navy sm:text-4xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="eyebrow shrink-0 pb-1 text-blue transition-colors hover:text-gold"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
