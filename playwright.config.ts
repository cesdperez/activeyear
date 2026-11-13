import { defineConfig, devices } from '@playwright/test';
import { PREVIEW_PORT } from './scripts/ports.js';

const baseURL = `http://localhost:${PREVIEW_PORT}`;

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 5,
	reporter: 'html',
	use: {
		baseURL,
		reducedMotion: 'reduce',
		// A US browser starts on miles and Imperial, so specs pin a metric region and opt into US.
		locale: 'en-GB',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
			testMatch: /export-(glow|fonts|shadows)\.spec\.ts/
		}
	],
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		url: baseURL,
		// A reused server keeps serving the build it started with, so tests would miss new changes.
		reuseExistingServer: process.env.E2E_REUSE_SERVER === '1'
	}
});
