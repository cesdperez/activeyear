import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_EVENT_BODY_LENGTH } from '#lib/constants/events.js';

const { env, writeDataPoint } = vi.hoisted(() => {
	const writeDataPoint = vi.fn();
	const env = {
		EVENTS: { writeDataPoint } as { writeDataPoint: typeof writeDataPoint } | undefined
	};
	Object.assign(globalThis, { __sveltekit_cloudflare_platform: { env } });
	return { env, writeDataPoint };
});
vi.mock('cloudflare:workers', () => ({ env }));
import { POST } from './+server.js';

const validBody = JSON.stringify({ event: 'export', value: 'neon' });
const post = (request: Request) => POST({ request } as Parameters<typeof POST>[0]);

describe('event endpoint', () => {
	beforeEach(() => {
		writeDataPoint.mockClear();
		env.EVENTS = { writeDataPoint };
	});
	it('writes a valid event with the request country', async () => {
		const request = new Request('https://example.com/api/event', {
			method: 'POST',
			body: validBody
		});
		Object.assign(request, { cf: { country: 'NL' } });
		expect((await post(request)).status).toBe(204);
		expect(writeDataPoint).toHaveBeenCalledExactlyOnceWith({
			blobs: ['export', 'neon', 'NL'],
			doubles: [1],
			indexes: ['export']
		});
	});
	it('rejects invalid events', async () => {
		expect(
			(
				await post(
					new Request('https://example.com', { method: 'POST', body: '{"event":"unknown"}' })
				)
			).status
		).toBe(400);
		expect(writeDataPoint).not.toHaveBeenCalled();
	});
	it('rejects oversized streamed bodies and cancels the reader', async () => {
		const cancel = vi.fn();
		const body = new ReadableStream({
			start(controller) {
				controller.enqueue(new Uint8Array(MAX_EVENT_BODY_LENGTH + 1));
			},
			cancel
		});
		const request = new Request('https://example.com', {
			method: 'POST',
			body,
			duplex: 'half'
		} as RequestInit);
		expect((await post(request)).status).toBe(400);
		expect(cancel).toHaveBeenCalledOnce();
		expect(writeDataPoint).not.toHaveBeenCalled();
	});
	it('rejects oversized content-length before reading', async () => {
		const request = new Request('https://example.com', {
			method: 'POST',
			body: validBody,
			headers: { 'content-length': String(MAX_EVENT_BODY_LENGTH + 1) }
		});
		expect((await post(request)).status).toBe(400);
		expect(request.bodyUsed).toBe(false);
		expect(writeDataPoint).not.toHaveBeenCalled();
	});
	it('accepts valid events without a binding', async () => {
		env.EVENTS = undefined;
		expect(
			(await post(new Request('https://example.com', { method: 'POST', body: validBody }))).status
		).toBe(204);
		expect(writeDataPoint).not.toHaveBeenCalled();
	});
});
