import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

type Manifest = Record<string, { file: string; imports?: string[] }>;

const MODULEPRELOAD = /<link href="\/([^"]+)" rel="modulepreload">/g;

/** Preloads the page's dynamically imported locale catalog and its dependencies. */
export function catalogPreload(outputDir: string): Plugin {
	return {
		name: 'catalog-preload',
		apply: 'build',
		buildApp: {
			// SvelteKit must write the prerendered pages before this hook runs.
			order: 'post',
			async handler() {
				const manifest: Manifest = JSON.parse(
					readFileSync('.svelte-kit/output/client/.vite/manifest.json', 'utf-8')
				);
				for (const file of htmlFiles(outputDir)) {
					const html = readFileSync(file, 'utf-8');
					const updated = addCatalogPreloads(html, manifest, file);
					if (updated !== html) writeFileSync(file, updated);
				}
			}
		}
	};
}

function htmlFiles(dir: string): string[] {
	return readdirSync(dir, { recursive: true, encoding: 'utf-8' })
		.filter((file) => file.endsWith('.html'))
		.map((file) => join(dir, file));
}

function catalogFiles(manifest: Manifest, key: string, visited = new Set<string>()): string[] {
	if (visited.has(key)) return [];
	visited.add(key);
	const entry = manifest[key];
	if (!entry) throw new Error(`catalog-preload: missing manifest entry ${key}`);
	return [
		entry.file,
		...(entry.imports ?? []).flatMap((dependency) => catalogFiles(manifest, dependency, visited))
	];
}

function addCatalogPreloads(html: string, manifest: Manifest, file: string): string {
	const links = [...html.matchAll(MODULEPRELOAD)];
	if (links.length === 0) return html;
	const locale = html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1];
	if (!locale) throw new Error(`catalog-preload: missing html lang in ${file}`);
	const existing = new Set(links.map((link) => link[1]));
	const files = catalogFiles(manifest, `src/lib/i18n/messages/${locale}/index.ts`);
	const additions = files
		.filter((path) => !existing.has(path))
		.map((path) => `<link href="/${path}" rel="modulepreload">`)
		.join('');
	const last = links[links.length - 1];
	const end = last.index + last[0].length;
	return html.slice(0, end) + additions + html.slice(end);
}
