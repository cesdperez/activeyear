import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { cspScriptHashes } from './csp-script-hashes.ts';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({ routes: { include: ['/*'], exclude: ['/*'] } })
		}),
		cspScriptHashes('.svelte-kit/cloudflare')
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
