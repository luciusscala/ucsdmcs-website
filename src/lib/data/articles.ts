/**
 * Match reports and club news. Body is an array of paragraphs — no MDX, no CMS.
 * Add a new article by putting an object at the top of the list.
 */

export type Article = {
  slug: string;
  title: string;
  /** ISO 8601 date, e.g. "2026-10-05" */
  date: string;
  category: "Match Report" | "Club News" | "Feature";
  /** One or two sentences, used on cards and for link previews. */
  excerpt: string;
  author: string;
  body: string[];
};

/** TODO: replace with real reports. */
export const articles: Article[] = [
  {
    slug: "trident-holds-off-san-diego-state",
    title: "Trident holds off San Diego State in crosstown derby",
    date: "2026-09-27",
    category: "Match Report",
    excerpt:
      "A first-half header settled the crosstown derby and kept UC San Diego unbeaten at RIMAC Field.",
    author: "Club Media",
    body: [
      "UC San Diego edged San Diego State 1–0 at RIMAC Field on Saturday, taking the crosstown derby in front of the largest home crowd of the season so far.",
      "The only goal came midway through the first half, headed in at the back post from a corner. From there it was a matter of holding shape — the Aztecs pushed numbers forward after the break and forced a pair of good saves late.",
      "The result keeps the club unbeaten at home this season and moves it level on points with USC in the conference table.",
    ],
  },
  {
    slug: "road-trip-to-santa-barbara",
    title: "Costly afternoon on the road at Santa Barbara",
    date: "2026-10-04",
    category: "Match Report",
    excerpt:
      "Two second-half goals at Storke Field handed the club its first conference defeat of the season.",
    author: "Club Media",
    body: [
      "The club's unbeaten start ended at Storke Field, where UC Santa Barbara scored twice after the interval to take the points.",
      "Chances came at both ends in a scoreless first half. The hosts found the opener against the run of play and added a second on the counter with twenty minutes left.",
      "Attention now turns to a run of three straight at home, starting with UCLA.",
    ],
  },
  {
    slug: "season-preview-2026-27",
    title: "Season preview: what to watch in 2026–27",
    date: "2026-09-08",
    category: "Feature",
    excerpt:
      "A deeper squad, a harder conference schedule, and a realistic shot at regionals for the first time in three years.",
    author: "Club Media",
    body: [
      "The squad returns most of last season's spine and adds depth in midfield, which is where the conference is usually won or lost.",
      "The schedule is unforgiving early — three of the first four are against sides that finished above us last year — but the run-in is kinder, with three of the last four at RIMAC Field.",
      "The target is straightforward: finish in the top two and earn a place at USCCS regionals in November.",
    ],
  },
  {
    slug: "how-to-follow-the-club",
    title: "How to follow the club this season",
    date: "2026-09-01",
    category: "Club News",
    excerpt:
      "Fixtures, results and standings live on this site. Everything else — team news, travel, highlights — runs through Instagram.",
    author: "Club Media",
    body: [
      "Every fixture, result and conference table on this site updates through the season, usually within a day of the final whistle.",
      "Team news, travel updates and highlights go out on Instagram. Home matches at RIMAC Field are free and open to everyone.",
      "For anything else — tryouts, sponsorship, alumni — email the club directly.",
    ],
  },
];

const byDateDesc = (a: Article, b: Article) =>
  +new Date(b.date) - +new Date(a.date);

export const sortedArticles = () => [...articles].sort(byDateDesc);

export const articleBySlug = (slug: string) =>
  articles.find((a) => a.slug === slug) ?? null;
