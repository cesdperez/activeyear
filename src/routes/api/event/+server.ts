import { env } from 'cloudflare:workers';
import { MAX_EVENT_BODY_LENGTH } from '#lib/constants/events.js';
import { parseEvent } from '#lib/utils/events.js';
import type { RequestHandler } from './$types.js';

export const prerender = false;

async function readBody(request: Request): Promise<string | null> {
	if (Number(request.headers.get('content-length')) > MAX_EVENT_BODY_LENGTH) return null;
	if (!request.body) return '';
	const reader = request.body.getReader();
	const decoder = new TextDecoder();
	let length = 0;
	let body = '';
	while (true) {
		const { done, value } = await reader.read();
		if (done) return body + decoder.decode();
		length += value.byteLength;
		if (length > MAX_EVENT_BODY_LENGTH) {
			void reader.cancel();
			return null;
		}
		body += decoder.decode(value, { stream: true });
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await readBody(request);
	if (body === null) return new Response(null, { status: 400 });
	const result = parseEvent(body);
	if (!result.ok) return new Response(null, { status: 400 });
	const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? '';
	env.EVENTS?.writeDataPoint({
		blobs: [result.event, result.value, country],
		doubles: [1],
		indexes: [result.event]
	});
	return new Response(null, { status: 204 });
};
