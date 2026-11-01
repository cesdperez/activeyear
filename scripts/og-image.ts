// Regenerates static/og-image.png from the demo dashboard. Needs `pnpm build && pnpm preview` running.
// Usage: pnpm og-image [baseUrl]
import { chromium } from '@playwright/test';
import { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from '../src/lib/constants/og.ts';

const baseUrl = process.argv[2] ?? 'http://localhost:4173';

// Keeps only the heading and the four main stats, centred in the frame.
const COMPOSITION_CSS = `
	.noise-overlay, main > div > :not(header, [data-testid='main-stats']), header .mt-8 {
		display: none !important;
	}
	main > div {
		min-height: ${OG_IMAGE_HEIGHT}px !important;
		display: flex !important;
		flex-direction: column;
		justify-content: center;
		gap: 56px;
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}
	header, [data-testid='main-stats'] { margin: 0 !important; }
	[data-testid='main-stats'] { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
	* { transition: none !important; }
	.stat-card { padding: 24px !important; justify-content: flex-start !important; }
	.stat-value { font-size: 2rem !important; }
`;

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }
});

await page.goto(baseUrl);
await page.getByRole('button', { name: /demo data/ }).click();
// Stat cards fade in on a JS spring, so a fixed wait can catch them half transparent.
await page.waitForFunction(() =>
	[...document.querySelectorAll<HTMLElement>('[data-testid="main-stats"] .stat-card')].every(
		(card) => Number(card.style.opacity) > 0.99
	)
);
await page.addStyleTag({ content: COMPOSITION_CSS });
await page.screenshot({ path: 'static/og-image.png' });

await browser.close();
