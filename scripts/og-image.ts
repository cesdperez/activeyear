// Regenerates static/og-image*.png, one per locale, from the demo dashboard. Needs `pnpm build && pnpm preview` running in this checkout.
// Usage: pnpm og-image [baseUrl]
import { chromium } from '@playwright/test';
import { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, ogImageFile } from '../src/lib/constants/og.ts';
import { DEFAULT_LOCALE, LOCALES } from '../src/lib/constants/locales.ts';
import { TARGET_YEAR } from '../src/lib/constants/time.ts';
import { PREVIEW_PORT } from './ports.ts';

const baseUrl = process.argv[2] ?? `http://localhost:${PREVIEW_PORT}`;

// Keeps only the header and the totals board, centred in the frame, without the layout's top bars.
const COMPOSITION_CSS = `
	main > div > :not(:has(> header), [data-testid='main-stats']), header > button, [data-testid='main-stats'] dl,
	body .absolute.top-4 {
		display: none !important;
	}
	main > div {
		min-height: ${OG_IMAGE_HEIGHT}px !important;
		display: flex !important;
		flex-direction: column;
		justify-content: center;
		gap: 24px;
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}
	header, [data-testid='main-stats'] { margin: 0 !important; }
	* { transition: none !important; }
`;

const browser = await chromium.launch();

for (const locale of LOCALES) {
	// Reduced motion skips the headline count-up, so the image always shows the final total.
	// A metric region and a finished season, so the image shows the full year in km whenever it is made.
	const page = await browser.newPage({
		viewport: { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
		reducedMotion: 'reduce',
		locale: 'en-GB'
	});
	await page.clock.setFixedTime(new Date(TARGET_YEAR + 1, 0, 15));
	await page.goto(locale === DEFAULT_LOCALE ? baseUrl : `${baseUrl}/${locale}/`);
	await page.getByTestId('demo-data').filter({ visible: true }).click();
	await page.getByTestId('main-stats').waitFor();
	await page.evaluate(() => document.fonts.ready);
	await page.addStyleTag({ content: COMPOSITION_CSS });
	await page.screenshot({ path: `static/${ogImageFile(locale)}` });
	await page.close();
}

await browser.close();
