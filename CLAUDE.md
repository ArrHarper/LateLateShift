# Late Late Shift — fantasy football league site

Static Eleventy site for a 10-team Yahoo fantasy football keeper league (est. 2020).
Public repo; deployed to GitHub Pages.

## Build & deploy

- Build: `npx @11ty/eleventy` — outputs `src/` → `_site/` with `pathPrefix: /LateLateShift/`
- Local dev: `npx @11ty/eleventy --serve`
- Deploys to GitHub Pages automatically on push to `main` (gh-pages branch is CI-built; never edit it or `_site/` directly)

## Structure

- Page templates: `src/*.njk` (Nunjucks). Shared layout in `src/_includes/`:
  - `base.njk` — layout, nav include, footer/copyright, loads `js/table.js`
  - `_cta-bar.njk` — the "Time til Football" countdown; kickoff timestamp lives in its `data-target` attr (UTC)
  - `_components/` — macros incl. `infoTable` (used by teams page)
- Sortable tables (keeper history, etc.) use `js/table.js`: jQuery, binds to header anchor `id`s (`manager`, `team`, `keeper`, `pos`, `cost`, `years`), sorts `.table-row`s inside the nearest `.tabletm`. Numeric columns need class `filter__link--number`; cells may contain `n/a` (sorts to bottom) or values like `2*` (non-digits stripped).
- `backups/`, `oldHTML/`, `false/`, and the sibling `LateLateShift_pages` directory are dead legacy content — don't reference them.

## League facts the code doesn't state

- 10 teams, 6 make playoffs (weeks 15–17). Managers are stable but **team names change every season** — the keeper-history tables are the canonical manager↔team-name mapping per year.
- Yahoo issues a **new league ID each season** (2024: 455458, 2025: 716831, 2026: 858824), so every Yahoo URL on the site is season-specific. `football.fantasysports.yahoo.com/league/latelateshift` is the evergreen redirect.
- Keeper rules (full text on rules page): max 2 keepers; round-1 picks ineligible; same player max 2 consecutive seasons; cost = most recent draft round, one round better for a second consecutive keep; UDFAs cost an 8th (7th in year two). House ruling not yet on the rules page: if two keepers land on the same cost round, the second slides one round earlier.

## Annual season-update checklist

1. `src/index.njk` — hero year + "Year N", schedule card (kickoff matchup/date, trade deadline, playoff weeks), keeper button → new league URL, "last year" draft/roster links → prior league ID, champ card (manager, team, 🏆'YY, avatar image in `assets/images/`)
2. `src/_includes/_cta-bar.njk` — countdown `data-target` → new kickoff (ET is UTC−4 in September)
3. `src/recordBook.njk` — new season champion card (winner, score, bracket/draft links), re-check all-time records (single-season PF, streaks, etc.), bump Last Updated
4. `src/keeper-history.njk` — new season's keeper table (same 6-column format), bump Last Updated
5. `src/draft-order.njk` — new reveal video section at top (Wistia embed)
6. `src/teams.njk` — fold season W/L/PF/PA/moves into all-time rows; recompute derived columns from raw totals; champion gets 🏆
7. `src/_includes/base.njk` — copyright year
8. `scoringData/` — add season TE scoring md/csv

## Data sources

- Yahoo public (logged-out) pages provide: standings points, per-team records (team pages), draft results by round/team. NOT available logged-out: PA, moves, keeper markers, manager names — those need logged-in screenshots from the commissioner.
- The Yahoo Fantasy API requires approval via Yahoo's Sports Developer Portal (open self-service access ended 2026); the league's API CLI tool lives outside this repo.
- Keepers can be inferred from public data: intersect prior-season final rosters with the new draft (same manager, pick round ≈ keeper cost) — but late-round keeps and cost quirks need commissioner confirmation.
