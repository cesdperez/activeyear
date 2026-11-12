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
			testMatch: /export-(glow|fonts)\.spec\.ts/
		}
	],
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		url: baseURL,
		reuseExistingServer: !process.env.CI
	}
});
