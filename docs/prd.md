# ActiveYear — Product Requirements Document

## Overview

Browser-only "Year in Sport" infographic generator. Users upload activity data (CSV), and the app produces shareable social cards. All processing happens client-side — no data leaves the browser.

**Positioning:** *If Strava Wrapped is a summary, ActiveYear is a trophy.*

**Scope:** 2025 activities only. Multi-year CSVs are filtered to current year.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | SvelteKit 2 + Svelte 5 | Runes for reactive state; stable since Oct 2024 |
| CSV Parsing | PapaParse | Industry standard, streaming support, 13k+ stars |
| Screenshot | html-to-image | Battle-tested (58k dependents), full CSS support, ~12KB |
| Animation | svelte/motion (built-in) | Native Spring/Tween classes, zero bundle cost |
| Styling | Tailwind CSS 4 | CSS-first config, Oxide engine, stable since Jan 2025 |

---

## Features

### Core Metrics

| Metric | Calculation | Display Example |
|--------|-------------|-----------------|
| Activity Breakdown | Distance/time/count per sport type | "Running: 847km across 94 runs" |
| Earth Laps | Total distance ÷ 40,075 km | "0.05× around Earth" |
| Everests Climbed | Total elevation ÷ 8,848m | "2.3 Everests" |
| Pizza Index | Total calories ÷ 285 kcal | "1,247 pizza slices burned" |

### Personal Records

| Record | Logic |
|--------|-------|
| Longest Distance | Max `Distance` value |
| Longest Duration | Max `Elapsed Time` value |
| Biggest Burn | Max `Calories` value |

### Consistency Stats

| Stat | Logic |
|------|-------|
| Active Days | Count of unique activity dates |
| Longest Streak | Max consecutive days with ≥1 activity |
| Monthly Distribution | Activity count per month (visual bar/heatmap) |

### Themes

Three visual styles at launch:

1. **Neon** — Gradients, glow effects, dark background
2. **Minimalist** — Swiss grid, monochrome, high whitespace
3. **Retro** — Pixel fonts, chunky borders, 8-bit aesthetic

### Export Formats

| Ratio | Use Case |
|-------|----------|
| 9:16 | Instagram/TikTok Stories |
| 1:1 | Instagram/Twitter/LinkedIn feed |
| 4:5 | Instagram portrait posts |

All exports include watermark: `activeyear.app` (placeholder domain).

---

## User Flow

### Step 1: Data Instructions

**Garmin Connect:**
1. Log in at connect.garmin.com
2. Go to **Activities → All Activities**
3. Set filter to **2025** (or scroll to load all 2025 activities)
4. **Important:** Scroll down until all activities are loaded (Garmin only exports visible rows)
5. Click **Export CSV** (top-right icon)

**Strava:** *(v2)*
1. Go to **Settings → My Account → Download or Delete Your Account**
2. Click **Request your Archive**
3. Wait for email, download archive
4. Upload `activities.csv` from the archive

### Step 2: Upload

- Drag-and-drop zone with file picker fallback
- Progress indicator: "Analyzing 347 activities..."
- Privacy notice: "Your data never leaves this browser"

### Step 3: Customize & Export

- Theme selector (visual preview)
- Aspect ratio toggle
- Download PNG button

---

## Roadmap

### v1.0 — Garmin Launch

| Feature | Status |
|---------|--------|
| Garmin CSV parsing | Required |
| 2025 filter | Required |
| Core metrics (distance, time, calories, elevation) | Required |
| Personal records (3 types) | Required |
| Active days + longest streak | Required |
| 3 themes (Neon, Minimalist, Retro) | Required |
| 3 export ratios (9:16, 1:1, 4:5) | Required |
| Watermark | Required |

### v2.0 — Strava + Insights

| Feature | Description |
|---------|-------------|
| Strava CSV support | Parse Strava archive format |
| Race detection | Flag activities with "race" in title |
| Monthly heatmap | Visual activity distribution |
| Speed/pace records | Fastest km, fastest 5K, etc. |
| Additional themes | Topo, Nature, etc. |

### v3.0 — Social + Polish

| Feature | Description |
|---------|-------------|
| Expanded sport types | Hiking, swimming, skiing, strength as first-class |
| Share flow | Deep links to Instagram/Twitter with pre-filled content |
| Comparison mode | Year-over-year delta (2024 vs 2025) |
| Animations | Entry animations on dashboard reveal |
| PWA | Installable, offline-capable |

---

## Constraints

- **No backend.** All computation client-side.
- **No accounts.** No login, no storage, no cookies beyond essentials.
- **No tracking.** Privacy-first. Analytics limited to aggregate page views if any.
- **PNG only.** No video export in v1-v3.

---

## Personalization

- **Units:** User toggle (km/miles). Default based on locale if detectable.
- **Name field:** Optional text input displayed on card (e.g., "César's 2025").
