# Late Late Shift — fantasy football league site

Static Eleventy site for a 10-team Yahoo fantasy football keeper league (est. 2020).
Public repo; deployed to GitHub Pages. Redesigned Aug 2026 ("Network" design system).

## Build & deploy

- Build: `npx @11ty/eleventy` — outputs `src/` → `_site/` with `pathPrefix: /LateLateShift/`
- Local dev: `npx @11ty/eleventy --serve`
- Config: `eleventy.config.mjs` (ESM, Eleventy 3). Defines filters: `topValueKeeps`, `pct3`, `num2`, `newsDate`, `shortYears`.
- Deploys to GitHub Pages automatically on push to `main` (gh-pages branch is CI-built; never edit it or `_site/` directly)
- Zero runtime dependencies beyond Eleventy. No jQuery, no Bootstrap.

## Architecture: data-driven

League content lives in `src/_data/` — pages are loops over these files:

- `league.json` — `current` season block (year, league ID, kickoff timestamp for the countdown, deadlines, pot) + `seasons[]` (every season's champion/runner-up/score/league ID). Yahoo URLs are built in templates as `https://football.fantasysports.yahoo.com/{year}/f1/{leagueId}/...`
- `seasonStandings.json` — **source of truth for career stats.** Final standings for every season (finalRank, manager, team, W-L-T, PF, PA, streak, waiver priority, moves, clinchedPlayoffs). `finalRank` is playoff-inclusive placement, *not* regular-season seed. Rows flagged `alumni: true` are former members.
- `teams.json` / `alumni.json` — **generated** by `npm run derive` from seasonStandings.json; all-time stats per manager + title years (drives Teams page incl. computed superlatives) and the Alumni table
- `keepers.json` — keeper tables per season (rows match llsTable column order: manager, team, player, pos, cost, years). Canonical manager↔team-name mapping, but only back to 2022 — for 2020–21 use seasonStandings.json
- `records.json` — positive/negative record tiles (Records page). Hand-maintained: 7 tiles are checkable against seasonStandings.json, but the 5 stat-based ones (TDs, kicking points, drafted-player points, margin of defeat) need Yahoo
- `news.json` — homepage League News items (newest first; homepage shows 3)
- `draftVideos.json` — Wistia media IDs for draft-order reveal videos

## Design system

- `css/tokens.css` — all colors/type/radius as custom properties; the palette-job comments there are the spec. `css/site.css` — components. `css/fonts.css` — self-hosted Archivo variable.
- Conventions: flat surfaces (no borders/shadows — contrast only); navy header bars on all cards/tables; red only for alerts/live/kickers; every link/button has hover + active + focus-visible; primary buttons hover to red→purple radial gradient.
- Layout: `_includes/base.njk` (ticker w/ countdown, nav, footer). Macros: `_components/ui.njk` (pageHero, secHead, mod, championCard), `_components/llsTable.njk` (sortable/mobile-collapsible tables; behavior in `js/lls-table.js`), `_components/callout.njk`.
- Logos: `assets/images/lls-logo.svg` (full color, light surfaces) and `lls-logo-knockout.svg` (light linework, used on navy nav).
- Pages: index, teams, rules, keeper-history, recordBook, draft-order (unlisted — not in nav, shared by link).

## League facts the code doesn't state

- 10 teams, 6 make playoffs (weeks 15–17). Managers are stable but **team names change every season** — `keepers.json` is the canonical manager↔team-name mapping per year.
- Yahoo issues a **new league ID each season** (all IDs are in `league.json`). `football.fantasysports.yahoo.com/league/latelateshift` is the evergreen redirect.
- Keeper rules (full text on rules page): max 2 keepers; round-1 picks ineligible; same player max 2 consecutive seasons; cost = most recent draft round, one round better for a second consecutive keep; UDFAs cost an 8th (7th in year two). House ruling not yet on the rules page: if two keepers land on the same cost round, the second slides one round earlier.

## Annual season-update checklist

1. `src/_data/league.json` — add the finished season to `seasons[]` (champion, runner-up, scores, league ID); update `current` (year, seasonNo, new league ID, kickoff timestamp UTC, matchup, trade deadline, prior-year IDs). Everything downstream (homepage, ticker countdown, records page, quick links) updates itself.
2. `src/_data/keepers.json` — add the new season's keeper rows (newest first).
3. `src/_data/seasonStandings.json` — add the season's final standings, then run `npm run derive`. **Do not hand-edit `teams.json` or `alumni.json`** — both are generated from it (career totals, averages, title counts). `npm run derive -- --check` fails if they're stale.
4. `src/_data/records.json` — re-check all-time records (single-season PF, streaks, etc.).
5. `src/_data/draftVideos.json` — add the reveal video's Wistia ID.
6. `src/_data/news.json` — add/refresh items.
7. Champ avatar → `assets/images/`, referenced from the season's `champion.avatar` in league.json.
8. Update the "Last updated" strings passed to `pageHero(...)` in changed pages.

## Data sources

- Yahoo public (logged-out) pages provide: standings points, per-team records (team pages), draft results by round/team. NOT available logged-out: PA, moves, keeper markers, manager names — those need logged-in screenshots from the commissioner.
- The Yahoo Fantasy API requires approval via Yahoo's Sports Developer Portal (open self-service access ended 2026); the league's API CLI tool lives outside this repo.
- Keepers can be inferred from public data: intersect prior-season final rosters with the new draft (same manager, pick round ≈ keeper cost) — but late-round keeps and cost quirks need commissioner confirmation.
