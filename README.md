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

**ActiveYear** is a web tools that takes your Garmin (and maybe next year Strava) activity export CSVs and generates beautiful, social-media-ready stats cards for your 2025 year in sport. 

Whether you're a runner, cyclist, or multi-sport athlete, visualize your hard work with themes like **Neon**, **Minimalist**, and **Retro**.

## ✨ Features

- **🔒 Privacy First**: All data processing happens **100% in your browser**. Your CSV never leaves your device.
- **📊 Deep Insights**: 
  - **Activity Breakdown**: Distance, time, and count per sport.
  - **Fun Stats**: "Earth Laps", "Everests Climbed", and "Pizza Index" (calories burned).
  - **Consistency**: Tracking active streaks and monthly distribution.
- **🎨 Themed Exports**: Choose a visual style that fits your vibe.
- **📱 Social Ready**: One-click export for Instagram Stories (9:16), Posts (1:1), and Portrait (4:5).

## 🚀 How to Use

1. **Export your Data (Garmin)**:
   - Go to [Garmin Connect](https://connect.garmin.com) -> **Activities** -> **All Activities**.
   - Filter by **2025**.
   - **Important**: Scroll down until all activities are loaded in the table.
   - Click the "Export CSV" icon (top right).
2. **Upload**: Drag & drop your `Activities.csv` file into ActiveYear.
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

## 📄 License
This project is open source and available under the simple MIT license.
