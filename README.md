# ActiveYear

Turn your Garmin Connect or Strava activity export into shareable year-in-review cards.

https://activeyear.app

## Features

- Runs in your browser. No account is required. Activity data never leaves your device.
- Anonymous usage counts only. No cookies or tracking.
- See distance, time, and activity count for each sport.
- View fun stats such as Earth laps, Everests climbed, and pizza slices.
- Review activity streaks and monthly distribution.
- Choose from six card themes.
- Download three 1080x1920 PNG story cards.

## Usage

For Garmin Connect:

1. Open **Activities > All Activities**.
2. Filter for the year you want to review.
3. Scroll until every activity loads.
4. Select **Export CSV**.

For Strava, use `activities.csv` from your account export.

Drop the file into ActiveYear. Pick a theme, units, headline stat, name, and photo. Download the cards.

## Development

Svelte 5, SvelteKit, Tailwind CSS 4, TypeScript, deployed on Cloudflare Pages.

```bash
pnpm install
pnpm dev
pnpm test:run
pnpm test:e2e
pnpm check
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/](docs/) (`DESIGN.md`, `i18n.md`, and `analytics.md`).

## License

MIT. See [LICENSE](LICENSE).
