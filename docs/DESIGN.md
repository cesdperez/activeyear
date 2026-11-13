# ActiveYear: Design Guidelines

## Design Philosophy

**Core Principle:** _Achievement, not information._

ActiveYear celebrates athletic accomplishment. Every design decision should make users feel proud of their year. We're building trophies, not dashboards.

**Guiding Questions:**

- Does this make the user feel like an athlete?
- Would someone screenshot this unprompted?
- Does it feel earned, not generated?

---

## Visual Identity

### 2026 direction: familiar anchors, authored execution

Returning users must recognise the app at a glance, so the anchors stay: a centred landing page with the ActiveYear wordmark as the hero, "Your <TARGET_YEAR> in Sport" under it and the upload zone centred below; a centred dashboard header; cyan as the brand colour. Everything else is drawn for this product rather than taken from a kit.

- **Logotype:** `Logotype.svelte` sets "ActiveYear" in Big Shoulders Display 900 with a dotless i whose dot is a cyan day tick, the same mark the year lane draws. Use it on the landing page, the dashboard header, the 404 page and the export card header. The favicon is the same tick motif.
- **Signature:** the year lane (`widgets/YearLane.svelte`): one horizontal lane with a tick per day of the year (366 in a leap year). An active day's tick height is the square root of that day's training time, scaled to the busiest day, with a 30% floor. Rest days are short dim ticks. Highlights (ring) and personal records (diamond) sit above the lane like course points on a race profile. Markers closer than a head width merge into one head at their mean day, a record winning, so a busy stretch reads as one point instead of a blob. It appears on the dashboard and on the Summary card in every theme.
- **Totals:** a results board. One huge headline number (the focused stat, glowing), its fun fact, then the other totals, active days and longest streak in one ruled row. On phones the row becomes a results sheet: label left, value right. No boxes, no icons.
- **Section shapes fit their data:** results board, lane, bar chart, a dense highlights table, bib badges, donut with bars, then quarters board and two tables under More stats. Headings are not numbered.

### Tone

**Bold. Celebratory. Earned.**

- Confident typography that commands attention
- High contrast for maximum shareability
- Data as achievement, not spreadsheet
- Visceral impact over information density

### Color Principles

Use CSS variables for all colors. Define in `:root` with theme-specific overrides. None of the values come from the Tailwind palette.

Where CSS cannot reach (the PNG background fill and the `theme-color` meta tag), read each theme's surface from `THEME_SURFACES` in `src/lib/constants/themes.ts`. It is the one copy of those hex values outside `app.css`, and `themes.test.ts` fails if the two drift apart.

```css
:root {
	--color-surface: #0c1013;
	--color-surface-elevated: #131a1e;
	--color-surface-hover: #1b242a;
	--color-border: #26323a;
	--color-text-primary: #edf3f5; /* 17.1:1 on surface */
	--color-text-muted: #b6c4ca; /* 10.7:1 */
	--color-text-dim: #8a9aa2; /* 6.6:1 */
	--color-accent: #48d8e4; /* brand cyan, 11.1:1 */
	--color-accent-glow: rgba(72, 216, 228, 0.35);
	--color-accent-subtle: rgba(72, 216, 228, 0.12);
	--color-on-accent: #0c1013;
}
```

**Rules:**

- One dominant accent per theme. Sport colours are the one exception, because they encode data.
- Text contrast minimum: 7:1 for stats, 4.5:1 for labels.
- Glow only on the headline number (dashboard and Summary card). No gradient text anywhere.
- Fun facts ("438 pizza slices burnt") always use the `.fun-fact` footnote style: small italic dim text after a 3px accent tick.

### Typography

**Neon and Minimalist:** Big Shoulders Display (700, 800, 900) for the logotype, stat values, numerals and display headings, in sentence case. Archivo (400 to 700) for body, labels and buttons. Labels are sentence case, weight 500, never tracked uppercase.

**Retro:** Press Start 2P (400) for card titles, section headings and short labels. VT323 (400) for stats, sport names and body. Never use Press Start 2P for a value whose length varies. The logotype stays in Big Shoulders in every theme.

**Classic and Synthwave:** Outfit for display, text and stats. The logotype stays in Big Shoulders.

Fonts are self-hosted with Fontsource and included in dependencies. Never use more than two typefaces per theme, the logotype aside.

| Element          | Size                    | Weight                 |
| ---------------- | ----------------------- | ---------------------- |
| Headline number  | up to 11rem, fit to fit | 900, display font      |
| Section heading  | 1.875rem to 2.25rem     | 800, display font      |
| Board stat value | up to 3.25rem           | 800, display font      |
| Stat label       | 0.875rem                | 500, Archivo, sentence |
| Body text        | 1rem                    | 400                    |

Units in a stat value ("km", "h") are set smaller than the digits; size such a value with `scaledLength` so the digits, not the units, fill the space. Draw it with `ValueWithUnits.svelte` and pass the same `UNIT_SCALE` entry (from `src/lib/utils/totals.ts`) to both, so the drawn unit size matches the size the fit was measured with.

Month and weekday labels come from `monthLabels` and `weekdayLabels` in `src/lib/utils/date.ts`, which format with `Intl.DateTimeFormat` in the current locale. Never hard-code month or day names.

---

## Theme Specifications

The app, including landing page and dashboard, always uses Neon tokens. Themes apply to export cards. Volt was dropped: one brand cyan keeps every shared card recognisable.

### Neon

**Aesthetic:** Night race in brand cyan.

- **Surface:** #0c1013, elevated #131a1e, hover #1b242a, border #26323a
- **Text:** Primary #edf3f5, muted #b6c4ca, dim #8a9aa2
- **Accent:** #48d8e4. Text on accent buttons is #0c1013.
- **Export background:** a cyan radial glow from the top-left, drawn from a 135x240 PNG, and a 64x64 noise tile at 3%. CSS gradients dither per pixel and push the PNG past 2 MB.
- **Sport palette:** #48d8e4, #ff7d66, #d3e85e, #ffbf47, #b69cff, #ff80b5, #6d8dff, #5be3a6, #ff9d52, #e6d7a8, #9fd0ff, #e66b8f, #a8e0c6; other #7f8f97.

### Minimalist

**Aesthetic:** Swiss result sheet.

- **Surface:** #f6f7f7, elevated #eceeef, hover #e2e5e6, border #cdd2d4
- **Text:** Primary #0f1417 (17.3:1), muted #3b4449 (9.3:1), dim #525c61 (6.4:1)
- **Accent:** Signal red #c4281c (5.3:1 on the surface, 4.9:1 on elevated).
- **Effects:** No glow, gradients or noise.
- **Sport palette:** #c4281c, #0f1417, #525c61, #8b9499; other #c3c9cc. Each slice or bar sits next to its label, so colour is not the only cue.

### Retro

**Aesthetic:** Arcade high score.

- **Surface:** #1c1650, elevated #2b2470, hover #3a3283, border #ffd23a
- **Text:** Primary #fbf8ff (15.6:1), muted #cbc0f2 (9.7:1), dim #a9a1dc (6.9:1)
- **Accent:** #ffd23a (11.4:1) only.
- **Effects:** 4px solid borders, radius 0, hard offset shadow `8px 8px 0 #000` instead of glow.
- **Sport palette:** #ffd23a, #5fe08a, #ff7a7a, #6fa8ff, #ff7ccf, #ff9f45; other #a9a1dc.

### Classic

**Aesthetic:** Classic Neon, with the earlier look in the current card layout.

- **Surface:** #0a0a0b, elevated #141416, hover #1a1a1e, border #303035
- **Text:** Primary #fafafa, muted #d4d4d8, dim #a1a1aa
- **Accent:** #22d3ee.
- **Export background:** `classic-gradient.png` with a 64x64 noise tile at 3%.
- **Sport palette:** #22d3ee, #ff7d66, #d3e85e, #ffbf47, #b69cff, #ff80b5; other #a1a1aa.

### Synthwave

**Aesthetic:** Retro arcade, with the earlier look in the current card layout.

- **Surface:** #1e1b4b, elevated #2e2a6b, hover #3e387b, border #625b9a
- **Text:** Primary #fafafa, muted #c4b8ef, dim #a5a0d8
- **Accent:** #facc15.
- **Effects:** Avatar border and decoration #ff00cc, 20% radius and hard shadow `8px 8px 0 rgba(0, 0, 0, 0.3)`.
- **Sport palette:** #facc15, #5fe08a, #ff7a7a, #6fa8ff, #ff7ccf, #ff9f45; other #a5a0d8.

Classic and Synthwave use the centered 320px Summary-card avatar with glow and spiral decoration. `CENTERED_AVATAR_THEMES` in `src/lib/constants/themes.ts` identifies them.

### Lightmile

Reserved and disabled in the theme picker until designed. Add it to `Theme` when it ships.

---

## Component Patterns

### Stat Cards

The atomic unit of ActiveYear. Must be instantly readable and screenshot-worthy.

**Structure:**

```
┌─────────────────────┐
│     STAT VALUE      │  ← Largest, boldest
│     stat label      │  ← Smaller, muted
│  supporting detail  │  ← Optional context
└─────────────────────┘
```

**Rules:**

- Value always dominates. 3x-4x larger than label.
- Round aggressively for impact: "847 km" not "847.32 km"
- One idea per card. No compound stats.

### Personal Records

Badge-like treatment. These are achievements, not data points.

**Visual Cues:**

- A race bib: flat elevated panel, 4px accent band across the top, two safety-pin holes.
- Label, value, then the activity title under a rule. No icon.
- A value that shrinks to fit keeps the full-size line box, so values, rules and titles line up across bibs.

### Progress Indicators

For upload/processing states:

- Determinate when possible ("Analyzing 127 of 347 activities...")
- Skeleton loading for metric cards (pulsing placeholder, not spinner)
- Success state with brief celebration (subtle scale + fade)

### Buttons

**Primary (Download/Export):**

- Full accent color background
- High contrast text
- Generous padding (1rem 2rem minimum)
- Hover: background turns text-primary. Nothing moves.

**Secondary (Theme/Ratio toggles):**

- One `.segmented` control everywhere: a bordered row of buttons, the pressed one filled with the accent.
- Secondary actions use `.btn-secondary`: 1px border, no fill.

---

## Layout

### Responsive Strategy

**Mobile-first.** The card is the product; it must be perfect at 375px.

| Breakpoint | Behavior                                                 |
| ---------- | -------------------------------------------------------- |
| < 640px    | Single column. Stacked cards. Full-bleed export preview. |
| 640-1024px | 2-column grid for stats. Preview centered.               |
| > 1024px   | Sidebar controls + main preview area.                    |

The language picker sits in the top-right corner of every page except the 404, 16px from the top and 16px from the right (32px from `md`). On the dashboard the toolbar (km/mi toggle and celebration button) sits directly to its left in the same row, vertically centred on it. The root layout holds both in one bar, so they cannot drift apart or overlap at any width.

### Export Canvas

The shareable image. This is what users actually care about.

**Layout Principles:**

- Visual hierarchy: Name/year → Hero stat → Supporting stats → Watermark
- Safe zone: 54px (5%) on every edge.
- Watermark: Bottom-right, `activeyear.app`, text-dim, Archivo 600, or VT323 in Retro.
- Canvas: 9:16 only, 1080×1920. Each PNG must be under 2 MB.
- Hero numbers use the display font and fit with the existing `.fit-value` rule.

Card header: logotype and "Season <TARGET_YEAR>" on one row, then the name and the card title. The Summary card shows the headline number, the year lane and a ruled list of the other totals.

**Aspect Ratios:**

- 9:16 (1080×1920) only. Add 4:5 later only if users ask to post to their feed.

### Landing page

- Centred: the logotype at `clamp(4.25rem, 19vw, 7.5rem)`, "Your <TARGET_YEAR> in Sport" under it, the upload zone centred below, then the demo link, the export guides and the questions.
- The upload zone is a flat elevated surface with a 1px dashed border in text-dim; on hover or dragover the border turns solid accent and the surface lifts one step in colour.

---

## Motion

Use Svelte's built-in `svelte/motion` (`Tween`).

### The one motion moment

The dashboard headline number counts up once on load (`CountUp.svelte`, 1.4s, cubic out). It renders the formatted total itself once the tween ends, never a re-format of a fraction, so it cannot settle on a wrong value. Under reduced motion it starts at the total. Export cards never animate.

Nothing else moves on its own: no staggered entrances, no hover lift or scale. Motion that answers an action (the More stats caret, a pressed toggle) is fine.

### Performance Rules

- Prefer `transform` and `opacity` (GPU-accelerated)
- No animation on scroll-locked elements
- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
  	*,
  	*::before,
  	*::after {
  		animation-duration: 0.01ms !important;
  		transition-duration: 0.01ms !important;
  	}
  }
  ```

---

## Accessibility

### Requirements

- All interactive elements keyboard accessible
- Focus states visible and on-theme (use accent color ring). Headings that take focus from script (`tabindex="-1"`) show no ring: they are not controls.
- Color contrast meets WCAG AA minimum
- Alt text for decorative icons: `aria-hidden="true"`
- Screen reader announcements for state changes (upload complete, etc.)

### Focus States

```css
:focus-visible {
	outline: 2px solid var(--color-accent);
	outline-offset: 2px;
}
```

---

## Imagery & Icons

### Icons

Use a consistent icon set. Recommendations:

- Lucide (clean, customizable stroke width)
- Phosphor (multiple weights)

**Rules:**

- Stroke width consistent across all icons (1.5-2px)
- Size proportional to adjacent text (1.25em default)
- Accent color for interactive, muted for decorative

### Decorative Elements

- Noise: the Neon export card only, a PNG tile at 3% opacity
- Gradients: the Neon export glow only, drawn from a small PNG
- Grid/lines: Subtle, never compete with data

---

## Copy Guidelines

### Tone

Confident, concise, celebratory.

**Do:**

- "847 km" (clean, proud)
- "2.3 Everests climbed" (achievement framing)
- "Your data never leaves this browser" (direct reassurance)

**Don't:**

- "You ran a total of 847.32 kilometers this year!" (verbose, try-hard)
- "2.3x the elevation of Mount Everest" (explaining the joke)
- "We take your privacy seriously..." (corporate speak)

### Number Formatting

- Distances: No decimals under 100, one decimal over ("42 km", "847.3 km")
- Elevation: Round to nearest 10m
- Time: Hours and minutes ("127h 34m"); seconds only for a total under a minute ("45s")
- Calories: Round to nearest 100 for totals
- Counts: Exact numbers ("94 runs", not "~90 runs")

## Languages

Locale comes from the URL. `/` is English; the other prerendered copies use `src/routes/[[lang=locale]]` and the matcher in `src/params.ts`. Do not redirect based on `Accept-Language`, because the CSP blocks inline scripts. `src/lib/components/LanguagePicker.svelte` lets visitors choose a language and shows returning visitors a dismissible prompt stored in localStorage as `activeyear.locale`.

Strings live in typed catalogs at `src/lib/i18n/messages/<locale>/<namespace>.ts`. English defines the shape; other locales are typed as `typeof en`, so `pnpm check` catches missing keys. Components read `i18n.m` and `i18n.locale` from `#lib/i18n/i18n.svelte.js`; plain TypeScript uses `MESSAGES[locale]`. Use `plural(locale, n, { one, other })` for plurals. Keep phrases with values as whole functions, never glued fragments, because word order differs between languages.

Number and date formatting takes a `locale` and uses `INTL_LOCALES`. Unit suffixes (`km`, `mi`, `m`, `ft`, `kcal`, `h`, `m`, `s`) stay the same in every language. Parsing stays independent of the UI language: parsers keep English messages for logs, and the UI maps error types to translated text.

German, Dutch, and French can run 20 to 35% longer than English. Every card and widget must fit the longest translation. The German card snapshots in `tests/e2e/visual-export.spec.ts` guard this.

### Add a Language

1. Add the code to `LOCALES`, `LOCALE_NAMES`, `INTL_LOCALES`, and `OG_LOCALES` in `src/lib/constants/locales.ts`.
2. Copy `src/lib/i18n/messages/en/` to the new locale, translate the strings, type each namespace as `typeof en`, and register it in `src/lib/i18n/messages/index.ts`.
3. Check that the fonts cover the script. The layout loads only the `latin` and `latin-ext` subsets of Big Shoulders Display, Archivo, Press Start 2P and VT323, which cover every letter of the six current languages but no Cyrillic, Greek or CJK. None of them has U+202F (the narrow no-break space French uses as a thousands separator) or the → arrow in the export guides; those come from the system fallback font. RTL languages also need layout work.
4. Run `pnpm check`, then inspect all three cards in the new language.

---

## Implementation Checklist

### Before Building a Component

- [ ] Which theme(s) does this appear in?
- [ ] What's the mobile layout?
- [ ] Does it animate? What triggers it?
- [ ] Is there a loading/empty state?

### Before Shipping a Feature

- [ ] Fits the 9:16 card with 5-digit totals and long sport names
- [ ] Renders correctly in every theme
- [ ] Keyboard accessible
- [ ] Motion respects reduced-motion preference
- [ ] Screenshot test: would you share this?

---

## Anti-Patterns

Avoid these common pitfalls:

| Anti-Pattern             | Why It Fails                     | Do Instead                                     |
| ------------------------ | -------------------------------- | ---------------------------------------------- |
| Gradient soup            | Feels AI-generated, no hierarchy | One accent, applied consistently               |
| Stat overload            | Dilutes impact, decision fatigue | Curate ruthlessly. 6-8 stats max per card.     |
| Generic icons            | Feels like a template            | Sport icons only; no icon in every card corner |
| Same shape every section | Reads as a template              | Fit the shape to the data: board, lane, table  |
| Thin fonts for stats     | Hard to read, feels weak         | Bold weights for numbers. Stats are headlines. |
| Drop shadows everywhere  | Dated, noisy                     | Reserve for intentional elevation.             |

---

## Reference Palette

Quick-reference values for common needs:

### Spacing Scale (rem)

`0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4 | 6 | 8`

### Border Radius

- Panels: `6px` (`--radius-panel`), `0` in Retro
- Controls: `4px` (`--radius-control`)
- No pills. Circles only for the avatar and lane markers.

### Transitions

```css
--transition-fast: 150ms ease-out;
--transition-base: 200ms ease-out;
```
