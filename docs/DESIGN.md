# ActiveYear: Design Guidelines

Token values live in code: colours, radii and transitions in `src/app.css` (`:root` for Neon, `[data-theme='…']` for the others), sport colours in `SPORT_PALETTES` (`src/lib/constants/sports.ts`), theme fonts in `THEME_FONT_FAMILIES` (`src/lib/constants/fonts.ts`). This file holds the rules and the reasons behind them.

## Design Philosophy

**Core Principle:** _Achievement, not information._

ActiveYear celebrates athletic accomplishment. Every design decision should make users feel proud of their year. We're building trophies, not dashboards.

**Guiding Questions:**

- Does this make the user feel like an athlete?
- Would someone screenshot this unprompted?
- Does it feel earned, not generated?

**Tone:** bold, celebratory, earned. Confident typography, high contrast for shareability, data as achievement rather than spreadsheet.

---

## Visual Identity

### Familiar anchors, authored execution

Returning users must recognise the app at a glance, so the anchors stay: a centred landing page with the ActiveYear wordmark as the hero, "Your <TARGET_YEAR> in Sport" under it and the upload zone centred below; a centred dashboard header; cyan as the brand colour. Everything else is drawn for this product rather than taken from a kit.

- **Logotype:** `Logotype.svelte` sets "ActiveYear" in Big Shoulders Display 900 with a dotless i whose dot is a day tick in the accent colour, the same mark the year lane draws. Use it on the landing page, the dashboard header, the 404 page and the export card header. The favicon is the same tick motif.
- **Signature:** the year lane (`widgets/YearLane.svelte`): one horizontal lane with a tick per day of the year (366 in a leap year). An active day's tick height is the square root of that day's training time, scaled to the busiest day, with a 30% floor. Rest days are short dim ticks. Highlights (ring) and personal records (diamond) sit above the lane like course points on a race profile. Markers closer than a head width merge into one head at their mean day, a record winning, so a busy stretch reads as one point instead of a blob. During a running season, future days have no ticks and the baseline is dotted and dimmer after today. It appears on the dashboard and on the Summary card in every theme.
- **Dashboard notices:** the header shows muted warnings for skipped rows and Garmin exports that may stop before the full year.
- **Totals:** a results board. One huge headline number (the focused stat, glowing), its fun fact, then the other totals, active days and longest streak in one ruled row. On phones the row becomes a results sheet: label left, value right. No boxes, no icons.
- **Section shapes fit their data:** results board, lane, bar chart, a dense highlights table, bib badges, donut with bars, then quarters board and two tables under More stats. Headings are not numbered.

### Color

Use the CSS variables for every colour; none of the values come from the Tailwind palette.

Where CSS cannot reach (the PNG background fill and the `theme-color` meta tag), read each theme's surface from `THEME_SURFACES` in `src/lib/constants/themes.ts`. It is the one copy of those hex values outside `app.css`, and `themes.test.ts` fails if the two drift apart.

- One dominant accent per theme. Sport colours are the one exception, because they encode data.
- Text contrast minimum: 7:1 for stats, 4.5:1 for labels.
- Glow only on the headline number (dashboard and Summary card), plus the Summary-card avatar in Classic and Synthwave. No gradient text anywhere.
- Fun facts ("438 pizza slices burnt") always use the `.fun-fact` footnote style: small italic dim text after a 3px accent tick.

### Typography

**Neon and Minimalist:** Big Shoulders Display (700, 800, 900) for the logotype, stat values, numerals and display headings, in sentence case. Archivo for body, labels and buttons. Labels are sentence case, weight 500, never tracked uppercase.

**Retro:** Press Start 2P (400) for card titles, section headings and short labels. VT323 (400) for stats, sport names and body. Never use Press Start 2P for a value whose length varies. The logotype stays in Big Shoulders in every theme.

**Classic and Synthwave:** Outfit for display, text and stats.

**Lightmile:** Archivo for display and statistics, Geist Mono for labels and metadata.

Never use more than two typefaces per theme, the logotype aside. Stat values and headings use bold display weights (800 to 900); stats are headlines.

Units in a stat value ("km", "h") are set smaller than the digits; size such a value with `scaledLength` so the digits, not the units, fill the space. Draw it with `ValueWithUnits.svelte` and pass the same `UNIT_SCALE` entry (from `src/lib/utils/totals.ts`) to both, so the drawn unit size matches the size the fit was measured with.

Month and weekday labels come from `monthLabels` and `weekdayLabels` in `src/lib/utils/date.ts`, which format with `Intl.DateTimeFormat` in the current locale. Never hard-code month or day names. The year lane uses `laneMonthLabels`, which drops the abbreviation period, and shrinks every month label to the size that fits the shortest month.

---

## Themes

The app, including landing page and dashboard, always uses Neon tokens. Themes apply to export cards only. There is one brand cyan so every shared card stays recognisable.

- **Neon:** night race in brand cyan. Export background: a cyan radial glow from the top-left, drawn from a 135x240 PNG, and a 64x64 noise tile at 3%. CSS gradients dither per pixel and push the PNG past 2 MB, so gradient and noise backgrounds are small PNGs.
- **Minimalist** (label "Minimal"): Swiss result sheet. Signal red accent. No glow, gradients or noise. Its sport palette has four colours, so each slice or bar sits next to its label and colour is not the only cue.
- **Retro:** arcade high score. Yellow accent only. 4px solid borders, radius 0, hard offset shadow `8px 8px 0 #000` instead of glow.
- **Classic:** Neon's original palette (`#22d3ee` accent) in the current card layout. Export background: `classic-gradient.png` with the same noise tile.
- **Synthwave:** retro arcade in indigo and yellow. Avatar border and decoration `#ff00cc`, 20% radius and a hard shadow.
- **Lightmile:** paper and ink. An editorial paper surface lets the athlete's numbers lead, with a thin dashed blue route line in the background as a nod to running. Electric blue accent with paper text on blue. A "?" button in the corner of the Lightmile theme tile (a sibling laid over the tile, not nested in it) opens a non-modal introduction and link on hover, focus or tap; Escape or a tap outside closes it, and a click after hovering keeps it open. The export header pairs the ActiveYear and Lightmile wordmarks with a muted multiplication sign, and the footer credits both activeyear.app and lightmile.nl.

Classic and Synthwave use the centred Summary-card avatar with glow and spiral decoration. `CENTERED_AVATAR_THEMES` in `src/lib/constants/themes.ts` identifies them.

---

## Component Patterns

### Stats

- The value dominates: 3x to 4x larger than its label.
- Round for impact (see Number Formatting).
- One idea per stat. No compound stats.

### Personal Records

Badge-like treatment. These are achievements, not data points.

- A race bib: flat elevated panel, 4px accent band across the top, two safety-pin holes.
- Label, value, then the activity title under a rule. No icon.
- A value that shrinks to fit keeps the full-size line box, so values, rules and titles line up across bibs.

### Buttons

- **Primary (Download/Export):** full accent background, high-contrast text. Hover turns the background text-primary. Nothing moves.
- **Segmented toggles (units, ratio-style choices):** `.segmented`, a bordered row of buttons, the pressed one filled with the accent. The theme and headline-stat pickers are a `.toggle` grid in `ExportPanel.svelte`.
- **Secondary actions:** `.btn-secondary`, a 1px border and no fill.

---

## Layout

**Mobile-first.** The card is the product; it must be perfect at 375px.

The language picker and, on the dashboard, the toolbar (km/mi toggle and celebration button) share one bar in the root layout's banner landmark, so they cannot drift apart or overlap at any width. The celebration button is hidden under reduced motion, where no confetti falls. The 404 page has no picker. Back to start is the dashboard's one way back to the upload screen. It is fixed at the top-left, level with the right bar, so it stays in reach while the page scrolls, and the page keeps a top scroll padding so a focused control is never under it. The dashboard has its own history entry, so browser Back returns to the start screen like Back to start.

### Export Canvas

The shareable image. This is what users actually care about.

- Visual hierarchy: Name/year → Hero stat → Supporting stats → Watermark.
- Canvas: 9:16 only, 1080×1920. Each PNG must be under 2 MB. Add 4:5 only if users ask to post to their feed.
- Safe zone: 54px (5%) on every edge.
- Watermark: bottom-right, `activeyear.app`, muted text in the theme's text font.
- Hero numbers use the display font and fit with the existing `.fit-value` rule.
- Card header: logotype and "Season <TARGET_YEAR>" on one row, then the name and the card title. A running season adds “so far” to the season label. The Summary card shows the headline number, the year lane and a ruled list of the other totals.

### Export panel

- The preview comes first. Stacked on phones, it takes at most 55% of the large viewport height, so a theme tapped under it changes the card in view. From 1024px it sits beside the controls, and the two columns are centred together.
- The preview sizes from the width and the large viewport height only, so a phone's URL bar or browser zoom never shrinks it below 240px.
- Theme tiles are two equal-height columns in every locale.
- After a download, a confirmation takes the helper line's place under the button for a few seconds.

### Landing page

- On phones and touch tablets, show a short export hint and a full-width demo button before the upload zone.
- The upload zone is a flat elevated surface with a dashed border; on hover or dragover the border turns solid accent and the surface lifts one step in colour.

### Site footer

Every page ends with a quiet footer (`SiteFooter.svelte`): on the dashboard the support line, then muted "Report an issue" (GitHub issues) and "See my other projects" (checho.xyz) links. External links open in a new tab, so a visitor never loses the dashboard.

### Support link

- Show "Buy me a gel" under the Download button after a successful export, in the site footer on the dashboard, and in the FAQ.
- The export prompt is "Enjoyed your recap? ActiveYear is free and made by one person." The dashboard prompt is "Enjoying ActiveYear?".
- Use an accent-coloured link that ends in a heart icon (`GelLink.svelte`), set inline so its text sits on the sentence's baseline.
- A compact fixed link appears after the header scrolls away and stays until the footer's support line is on screen. It also hides while the export confirmation's support line is on screen and while an export runs. It never hides for a section it passes over, because that made it blink in and out while scrolling. While it shows, the page has a bottom scroll padding so a focused control is never under it.
- Keep it a plain link so the CSP does not need to allow third-party scripts.

---

## Motion

### The one motion moment

The dashboard headline number counts up once on load (`CountUp.svelte`). It renders the formatted total itself once the tween ends, never a re-format of a fraction, so it cannot settle on a wrong value. Under reduced motion it starts at the total. Export cards never animate.

Nothing else moves on its own: no staggered entrances, no hover lift or scale. Motion that answers an action (the More stats caret, a pressed toggle) is fine. Prefer animating `transform` and `opacity`, and keep the global reduced-motion rule in `src/app.css` working.

---

## Accessibility

- Controls are at least 44px tall on touch screens (`pointer: coarse`), and text fields have a border with 3:1 contrast. Hover styles in plain CSS go under `@media (hover: hover)` (Tailwind's `hover:` already does), because a tap leaves them stuck on touch screens.
- Focus rings use the accent colour. Headings that take focus from script (`tabindex="-1"`) show no ring: they are not controls.
- Announce state changes to screen readers (upload complete, errors).

---

## Icons and Decoration

- Icons come from `phosphor-svelte`, sized to the adjacent text. Accent for interactive, muted for decorative (`aria-hidden="true"`).
- On cards, sport icons only; no icon in every card corner.
- Noise and gradient backgrounds only on the Neon and Classic export cards, drawn from PNGs.
- Panels use `--radius-panel`, controls `--radius-control`; Retro export cards set `--panel-radius` to 0. Pills are reserved for the floating support link.

---

## Copy Guidelines

Confident, concise, celebratory.

**Do:**

- "847km" (clean, proud)
- "2.3 Everests climbed" (achievement framing)
- "Your data never leaves this browser" (direct reassurance)

**Don't:**

- "You ran a total of 847.32 kilometers this year!" (verbose, try-hard)
- "2.3x the elevation of Mount Everest" (explaining the joke)
- "We take your privacy seriously..." (corporate speak)

### Number Formatting

`src/lib/utils/format.ts` owns these; use its formatters rather than formatting in a component.

- Distances: one decimal under 100, none from 100 ("42.2km", "847km"). No space before the unit.
- Elevation: nearest 10m (50ft).
- Time: hours and minutes ("127h 34m"), hours alone on a whole hour ("150h"); seconds only for a total under a minute ("45s").
- Calories: whole kcal with a thousands separator.
- Counts: exact numbers ("94 runs", not "~90 runs").

### Translations

German, Dutch and French can run 20 to 35% longer than English. Every card and widget must fit the longest translation. The German card snapshots in `tests/e2e/visual-export.spec.ts` guard this. String catalogs and adding a language are in `docs/i18n.md`.

---

## Before Shipping a Feature

- Fits the 9:16 card with 5-digit totals, long sport names and the German strings.
- Renders correctly in every theme.
- Has a mobile layout and a loading or empty state where data can be missing.

---

## Anti-Patterns

| Anti-Pattern             | Why It Fails                     | Do Instead                                     |
| ------------------------ | -------------------------------- | ---------------------------------------------- |
| Gradient soup            | Feels AI-generated, no hierarchy | One accent, applied consistently               |
| Stat overload            | Dilutes impact, decision fatigue | Curate ruthlessly. 6-8 stats max per card.     |
| Generic icons            | Feels like a template            | Sport icons only; no icon in every card corner |
| Same shape every section | Reads as a template              | Fit the shape to the data: board, lane, table  |
| Thin fonts for stats     | Hard to read, feels weak         | Bold weights for numbers. Stats are headlines. |
| Drop shadows everywhere  | Dated, noisy                     | Reserve for intentional elevation.             |
