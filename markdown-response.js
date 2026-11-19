/** @param {Request} request */
function prefersMarkdown(request) {
	if (request.method !== 'GET' && request.method !== 'HEAD') return false;
	const preferences = new Map();
	for (const entry of (request.headers.get('Accept') ?? '').split(',')) {
		const [type, ...parameters] = entry
			.toLowerCase()
			.split(';')
			.map((part) => part.trim());
		const weight = parameters.find((part) => /^q\s*=/.test(part));
		const quality = weight === undefined ? 1 : Number(weight.slice(weight.indexOf('=') + 1));
		if (type && quality >= 0 && quality <= 1) {
			preferences.set(type, Math.max(preferences.get(type) ?? 0, quality));
		}
	}
	const markdown = preferences.get('text/markdown') ?? 0;
	const html =
		preferences.get('text/html') ?? preferences.get('text/*') ?? preferences.get('*/*') ?? 0;
	return markdown > 0 && markdown >= html;
}

/**
 * @param {Request} request
 * @param {Response} response
 * @param {string} markdown
 */
export function markdownResponse(request, response, markdown) {
	if (response.status !== 200 && response.status !== 304) return response;
	if (
		response.status === 200 &&
		response.headers.get('Content-Type')?.split(';')[0] !== 'text/html'
	) {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.set('Content-Signal', 'ai-train=no, search=yes, ai-input=no');
	const vary = (headers.get('Vary') ?? '').split(',').map((value) => value.trim().toLowerCase());
	if (!vary.includes('*') && !vary.includes('accept')) headers.append('Vary', 'Accept');
	if (!prefersMarkdown(request))
		return new Response(response.body, { status: response.status, headers });

	for (const header of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified', 'Link']) {
		headers.delete(header);
	}
	headers.set('Content-Type', 'text/markdown; charset=utf-8');
	headers.set('Cache-Control', 'no-store');
	void response.body?.cancel();
	return new Response(request.method === 'HEAD' ? null : markdown, { headers });
}
