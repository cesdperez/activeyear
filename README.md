<div align="center">
  <h1>ActiveYear 🏃🚴🎨</h1>
  <h3>Turn your activity data into shareable year-in-review infographics.</h3>

  <p>
    <img src="https://img.shields.io/badge/Svelte%205-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte" />
    <img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>

  <p>
    <strong>Browser-only. Privacy-first. No login required.</strong>
  </p>
</div>

<br />

## 📖 Overview

**ActiveYear** ([activeyear.app](https://activeyear.app)) is a web tool that takes your Garmin activity export CSV and generates beautiful, social-media-ready stats cards for your year in sport.

Whether you're a runner, cyclist, or multi-sport athlete, visualize your hard work with themes like **Neon**, **Minimalist**, and **Retro**.

## ✨ Features

- **🔒 Privacy First**: The file is read and analysed on your device, and there is no account to create. We record a few anonymous counts (like which theme you export and whether uploads work) to improve the app. No cookies, no tracking, and your activity data never leaves your device.
- **📊 Deep Insights**:
  - **Activity Breakdown**: Distance, time, and count per sport.
  - **Fun Stats**: "Earth Laps", "Everests Climbed", and "Pizza Index" (calories burned).
  - **Consistency**: Tracking active streaks and monthly distribution.
- **🎨 Themed Exports**: Choose a visual style that fits your vibe.
- **📱 Social Ready**: One-click export of three story cards (1080×1920) for Instagram Stories and other feeds.

## 🚀 How to Use

1. **Export your Data (Garmin)**:
   - Go to [Garmin Connect](https://connect.garmin.com) -> **Activities** -> **All Activities**.
   - Filter by the year you want to review.
   - **Important**: Scroll down until all activities are loaded in the table.
   - Click the "Export CSV" icon (top right).
2. **Upload**: Drag & drop your `Activities.csv` file into ActiveYear.
   - If the file has no activities for the year, ActiveYear says which years it covers, or how many rows it could not read and why. Rows it skips are counted under the dashboard heading.
3. **Customize**: Pick your theme, adjust your name, and toggle stats.
4. **Export**: Download your personalized PNG and share!

## 💻 Development

This project is built with the **Svelte 5** (Runes), **SvelteKit**, and **Tailwind CSS 4**.

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run unit tests
pnpm test:run

# Run E2E tests
pnpm test:e2e
```

## 🔎 Search and AI discovery

The site URL, title and description live in `src/lib/constants/site.ts`. Prerendered routes build `robots.txt`, `sitemap.xml` and `llms.txt` from them, and the home page carries JSON-LD for the web app and its visible FAQ (`src/lib/data/faq.ts`).

## 📄 License

This project is open source and available under the simple MIT license.
