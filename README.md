# UC San Diego Men's Club Soccer

Next.js (App Router) + TypeScript + Tailwind CSS v4.

```bash
npm run dev   # http://localhost:3000
npm run build
```

## Pages

| Route | File |
| --- | --- |
| `/` | `src/app/page.tsx` — a short intro to the club beside an auto-advancing photo carousel, nothing else |
| `/schedule` | `src/app/schedule/page.tsx` — upcoming fixtures and results |
| `/roster` | `src/app/roster/page.tsx` — filterable squad + staff |
| `/stats` | `src/app/stats/page.tsx` — team totals, form, leaders, per-player table |
| `/standings` | `src/app/standings/page.tsx` — conference table |
| `/articles` | `src/app/articles/page.tsx` — match reports and club news |
| `/articles/[slug]` | `src/app/articles/[slug]/page.tsx` — one article, statically generated |
| `/tryouts` | `src/app/tryouts/page.tsx` — sessions, eligibility, kit, dues, FAQ |

## Editing content

All copy and data live in plain TypeScript files — no CMS, no database.

- `src/lib/site.ts` — club name, season, league, venue, email, socials, nav, logo paths
- `src/lib/data/schedule.ts` — fixtures and results (record and next match are derived from this)
- `src/lib/data/standings.ts` — conference table (points and goal difference are derived)
- `src/lib/data/roster.ts` — players, positions, staff and officers
- `src/lib/data/home.ts` — the home page intro copy and the carousel running order
- `src/lib/data/stats.ts` — per-player stat lines, keyed by jersey number so they
  stay joined to `roster.ts`; team totals are derived from `schedule.ts`
- `src/lib/data/articles.ts` — match reports and news; `body` is an array of
  paragraphs, and `slug` becomes the URL
- `src/lib/data/tryouts.ts` — sessions, eligibility, what to bring, dues and FAQ

Player headshots: drop files in `public/images/` and set `photo: "/images/…"` on the player.
Without a photo the card falls back to a navy tile with the jersey number.

## Design system

`src/app/globals.css` holds the whole system.

**Palette** — official UC San Diego brand colors on white:

| Token | Hex | Use |
| --- | --- | --- |
| `navy` | `#182B49` | Body text, dark sections, table header |
| `blue` | `#00629B` | Links, eyebrows, secondary accents |
| `yellow` | `#FFCD00` | Accent rules, active nav, badges (on navy only) |
| `gold` | `#C69214` | Accent for yellow-on-white situations |

Supporting neutrals (`surface`, `muted`, `border`, `border-strong`) and result colors
(`win`, `loss`, `draw`) are defined alongside them. Every token is a Tailwind utility —
`bg-navy`, `text-blue`, `border-yellow`, and so on.

**Type** — Barlow Condensed for display (`headline`, `eyebrow` utilities), Inter for body,
both self-hosted via `next/font`.

**Custom utilities** — `container-page` (page gutter + max width), `headline` (uppercase
condensed heading), `eyebrow` (small tracked-out all-caps label).

## Media

- `public/logos/` — trident (primary mark, also the favicon via `src/app/icon.png`),
  UC San Diego wordmark, UCSD Recreation, USCCS, NIRSA. The `*-white.png` files are
  single-color variants for use on navy, registered separately as `logosWhite` in
  `src/lib/site.ts`. They were derived from the color originals by mapping ink to
  white and light areas to transparent, which keeps knockout lettering — the USCCS
  crest, the NIRSA banner — legible instead of flattening it into a solid shape.
  Regenerate them the same way if an original is replaced.
- `public/images/` — photography, registered in `media` in `src/lib/site.ts`. Each
  entry carries its intrinsic size, alt text and a `focus` (CSS `object-position`)
  used when the photo is cropped — adjust `focus` if a crop cuts someone off.
  Currently: `breakaway`, `night`, `celebration` and `action` (the home carousel,
  ordered in `src/lib/data/home.ts`), `teamPhoto` (roster header), `huddleWide`
  (tryouts header).

`inspiration/` is reference only and is not part of the build.

## Chrome

Two-layer header: a navy identity bar holding the trident alone, over a gold navigation
bar, matching UC San Diego athletics. Nav labels are small tracked-out caps; a navy
underline slides between them, following the hovered or focused link and returning to
the current page on mouse-out. The bar scrolls horizontally on narrow screens rather
than collapsing into a menu.
Footer is a single navy block, trimmed to essentials: trident and club name, the
university mailing address, and contact links, over a centered row of affiliation
logos in white.

The home carousel crossfades on a 5s timer, pauses on hover, and sits out entirely
under `prefers-reduced-motion`. Progress dots below the card are the only control.

## Photo sizing

Sources are small: the match photos are 800px wide, the two older banners 1024–1086px.
A full-bleed banner on a 1440px retina screen asks for ~2880px, so anything full-width
from these renders soft. Every photo is therefore placed at half-width or less —
`SplitHero` and the tryouts header take a column, and the home carousel card is capped
at `max-w-[38rem]` (608px) so the 800px files are never upscaled at 1x and stay
reasonable at 2x. If higher-resolution originals turn up (2400px+), raising that cap
and letting `SplitHero` go full-bleed are the only changes needed.
