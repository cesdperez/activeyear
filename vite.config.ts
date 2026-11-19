import { markdownPages } from './markdown-pages.js';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { catalogPreload } from './catalog-preload.js';
import { cspScriptHashes } from './csp-script-hashes.js';
import { DEV_PORT } from './scripts/ports.js';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			paths: { relative: false },
			adapter: markdownPages(
				{ routes: { include: ['/api/*'], exclude: [] } },
				'.svelte-kit/cloudflare'
			)
		}),
		catalogPreload('.svelte-kit/cloudflare'),
		cspScriptHashes('.svelte-kit/cloudflare')
	],
	resolve: {
		// The Node entry imports streams, which the Pages bundle cannot resolve.
		alias: { papaparse: 'papaparse/papaparse.min.js' }
	},
	server: { port: DEV_PORT, strictPort: true },
	test: {
		include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
		setupFiles: ['src/lib/i18n/messages/loadAll.test-setup.ts']
	}
});
