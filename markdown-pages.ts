import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import adapter from '@sveltejs/adapter-cloudflare';
import { NodeHtmlMarkdown } from 'node-html-markdown';

export function markdownPages(options: Parameters<typeof adapter>[0], output: string) {
	const cloudflare = adapter(options);
	return {
		...cloudflare,
		async adapt(builder: Parameters<typeof cloudflare.adapt>[0]) {
			await cloudflare.adapt(builder);

			const pages = new Map<string, string>();
			const converter = new NodeHtmlMarkdown({ ignore: ['svg', 'button', 'input', 'form', 'nav'] });
			for (const [path, page] of builder.prerendered.pages) {
				if (/(?:^|\/)404\/?$/.test(path)) continue;
				const html = readFileSync(join(output, page.file), 'utf8');
				const markdown = converter.translate(html).trim();
				if (markdown) pages.set(path, markdown + '\n');
			}

			const routesFile = join(output, '_routes.json');
			const routes = JSON.parse(readFileSync(routesFile, 'utf8')) as {
				include: string[];
				exclude: string[];
			};
			routes.include = [...new Set([...routes.include, ...pages.keys()])];
			if (routes.include.length + routes.exclude.length > 100) {
				throw new Error('Markdown pages exceed the Cloudflare Pages routing limit');
			}
			writeFileSync(routesFile, JSON.stringify(routes));

			const workerFile = join(output, '_worker.js');
			const worker = readFileSync(workerFile, 'utf8');
			const entry = 'export default {';
			if (!worker.includes(entry)) throw new Error('Cloudflare adapter worker entry point changed');
			const negotiation = readFileSync(new URL('./markdown-response.js', import.meta.url), 'utf8');
			writeFileSync(
				workerFile,
				worker.replace(entry, 'const worker = {') +
					`
${negotiation.replace('export function markdownResponse', 'function markdownResponse')}
const documents = new Map(${JSON.stringify([...pages])});
export default {
  ...worker,
  async fetch(request, env, ctx) {
    const response = await worker.fetch(request, env, ctx);
    const markdown = documents.get(new URL(request.url).pathname);
    return markdown ? markdownResponse(request, response, markdown) : response;
  }
};
`
			);
		}
	};
}
