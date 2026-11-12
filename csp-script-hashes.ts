import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

// JSON-LD is a data block that browsers never run, so it needs no hash.
const INLINE_SCRIPT =
	/<script(?![^>]*\ssrc=)(?![^>]*\stype="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
const SCRIPT_SRC = /^(\s*Content-Security-Policy:.*?\bscript-src)\b/m;

/**
 * Adds the sha256 of every inline script in the prerendered HTML to the
 * script-src of the Content-Security-Policy in the adapter's `_headers`.
 * SvelteKit's bootstrap script changes on every build, so it cannot be hashed by hand.
 */
export function cspScriptHashes(outputDir: string): Plugin {
	return {
		name: 'csp-script-hashes',
		apply: 'build',
		buildApp: {
			// Runs after SvelteKit's own post hook writes _headers, as long as this plugin is listed after sveltekit().
			order: 'post',
			async handler() {
				const headersPath = join(outputDir, '_headers');
				const sources = inlineScriptHashes(outputDir).map((hash) => `'sha256-${hash}'`);
				writeFileSync(headersPath, addScriptSources(readFileSync(headersPath, 'utf-8'), sources));
			}
		}
	};
}

function inlineScriptHashes(outputDir: string): string[] {
	const hashes = htmlFiles(outputDir).flatMap((file) =>
		[...readFileSync(file, 'utf-8').matchAll(INLINE_SCRIPT)].map(([, body]) =>
			createHash('sha256').update(body).digest('base64')
		)
	);
	return [...new Set(hashes)];
}

function htmlFiles(dir: string): string[] {
	return readdirSync(dir, { recursive: true, encoding: 'utf-8' })
		.filter((file) => file.endsWith('.html'))
		.map((file) => join(dir, file));
}

function addScriptSources(headers: string, sources: string[]): string {
	if (!SCRIPT_SRC.test(headers)) {
		throw new Error('csp-script-hashes: _headers has no Content-Security-Policy with a script-src');
	}
	return headers.replace(SCRIPT_SRC, `$1 ${sources.join(' ')}`);
}
