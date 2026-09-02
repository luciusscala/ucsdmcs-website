import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { SectionHeading } from "@/components/section-heading";
import { articleBySlug, articles, sortedArticles } from "@/lib/data/articles";
import { formatArticleDate } from "@/lib/format";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(
  props: PageProps<"/articles/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = articleBySlug(slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage(
  props: PageProps<"/articles/[slug]">,
) {
  const { slug } = await props.params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const more = sortedArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <article>
        <header className="bg-navy text-white">
          <div className="container-page py-12 sm:py-14">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/articles"
                className="eyebrow text-[0.6875rem] text-yellow transition-colors hover:text-white"
              >
                ← All articles
              </Link>
              <p className="eyebrow mt-8 text-white/50">{article.category}</p>
              <h1 className="headline mt-3 text-4xl sm:text-5xl">
                {article.title}
              </h1>
              <p className="mt-5 text-sm text-white/60">
                {formatArticleDate(article.date)} · {article.author}
              </p>
            </div>
          </div>
          <div className="h-1.5 bg-yellow" />
        </header>

        <div className="container-page py-12">
          <div className="mx-auto max-w-3xl">
            <p className="border-l-[3px] border-blue pl-5 text-lg leading-relaxed text-navy">
              {article.excerpt}
            </p>
            <div className="mt-8 space-y-5 leading-relaxed text-muted">
              {article.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-border bg-surface py-14">
          <div className="container-page">
            <SectionHeading
              eyebrow="Keep reading"
              title="More from the club"
              href="/articles"
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
