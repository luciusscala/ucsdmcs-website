import Link from "next/link";
import type { Article } from "@/lib/data/articles";
import { formatArticleDate } from "@/lib/format";

export function ArticleCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col rounded-lg border border-border bg-background p-6 transition-colors hover:border-blue ${
        featured ? "sm:p-8" : ""
      }`}
    >
      <p className="eyebrow text-[0.6875rem] text-blue">{article.category}</p>
      <h3
        className={`headline mt-2 text-navy ${
          featured ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        <Link
          href={`/articles/${article.slug}`}
          className="transition-colors group-hover:text-blue"
        >
          {/* Stretch the link across the whole card */}
          <span className="absolute inset-0" aria-hidden />
          {article.title}
        </Link>
      </h3>
      <p
        className={`mt-3 leading-relaxed text-muted ${
          featured ? "text-base" : "text-sm"
        }`}
      >
        {article.excerpt}
      </p>
      <p className="mt-5 text-xs text-muted/80">
        {formatArticleDate(article.date)} · {article.author}
      </p>
    </article>
  );
}
