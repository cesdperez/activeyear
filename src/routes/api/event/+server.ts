import { parseEvent } from '#lib/utils/events.js';
import type { RequestHandler } from './$types.js';

export const prerender = false;

export const POST: RequestHandler = async ({ request, platform }) => {
	const result = parseEvent(await request.text());
	if (!result.ok) return new Response(null, { status: 400 });
	platform?.env?.EVENTS?.writeDataPoint({
		blobs: [result.event, result.value, platform.cf?.country ?? ''],
		doubles: [1],
		indexes: [result.event]
	});
	return new Response(null, { status: 204 });
};
