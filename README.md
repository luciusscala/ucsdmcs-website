# UC San Diego Men's Club Soccer

Next.js (App Router) + TypeScript + Tailwind CSS v4.

```bash
npm run dev   # http://localhost:3000
npm run build
```

## Pages

| Route | File |
| --- | --- |
| `/` | `src/app/page.tsx` — hero, next match, season snapshot, fixtures/results, standings preview, tryouts |
| `/roster` | `src/app/roster/page.tsx` — filterable squad + staff |
| `/schedule` | `src/app/schedule/page.tsx` — upcoming fixtures and results |
| `/standings` | `src/app/standings/page.tsx` — conference table |

## Editing content

All copy and data live in plain TypeScript files — no CMS, no database.

- `src/lib/site.ts` — club name, season, league, venue, email, socials, nav, logo paths
- `src/lib/data/schedule.ts` — fixtures and results (record and next match are derived from this)
- `src/lib/data/standings.ts` — conference table (points and goal difference are derived)
- `src/lib/data/roster.ts` — players, positions, staff and officers

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
  UC San Diego wordmark, UCSD Recreation, USCCS, NIRSA.
- `public/images/` — banner photography, registered in `media` in `src/lib/site.ts`.
  Each entry carries its intrinsic size, alt text and a `focus` (CSS `object-position`)
  used when the photo is cropped into a wide band — adjust `focus` if a crop cuts
  someone off. Currently: `lineups` (home hero), `teamPhoto` (roster header),
  `huddleWide` (standings section), `huddle` (tryouts band).

`inspiration/` is reference only and is not part of the build.

## Chrome

Two-layer header: navy identity bar (trident in a blue keyline box, wordmark, and
season/social links) over a gold navigation bar, matching UC San Diego athletics. The
nav bar scrolls horizontally on narrow screens rather than collapsing into a menu.
Footer is a white affiliations band — logos desaturated and faded, full color on
hover — above a navy three-column footer.

## Photo sizing

The supplied photos are 1024–1348px wide. A full-bleed banner on a 1440px retina screen
asks for ~2880px, so anything full-width from these sources renders soft. Every photo is
therefore placed at half-width or less (`SplitHero`, the standings and tryouts sections),
which keeps them at or near 1:1 pixels. If higher-resolution originals turn up (2400px+),
`SplitHero` can go full-bleed without changing anything else.
