import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { HeroStats, PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { articles, sortedArticles } from "@/lib/data/articles";
import { formatArticleDate } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Articles",
  description: `Match reports, club news and features from the ${site.season} UC San Diego men's club soccer season.`,
};

export default function ArticlesPage() {
  const all = sortedArticles();
  const [latest, ...rest] = all;
  const reports = all.filter((a) => a.category === "Match Report").length;

  return (
    <>
      <PageHero
        eyebrow={`${site.season} Season`}
        title="Articles"
        description="Match reports, club news and the occasional longer read, written by the club."
        aside={
          all.length > 0 ? (
            <HeroStats
              stats={[
                { label: "Published", value: String(all.length) },
                { label: "Match Reports", value: String(reports) },
                { label: "Latest", value: formatArticleDate(latest.date) },
              ]}
            />
          ) : undefined
        }
      />

      {articles.length === 0 ? (
        <section className="container-page py-20">
          <p className="text-muted">Nothing published yet — check back soon.</p>
        </section>
      ) : (
        <>
          <section className="container-page py-14">
            <SectionHeading eyebrow="Latest" title={latest.category} />
            <ArticleCard article={latest} featured />
          </section>

          {rest.length > 0 && (
            <section className="border-t border-border bg-surface py-14">
              <div className="container-page">
                <SectionHeading eyebrow="Archive" title="More from the club" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
