import { test, expect } from '@playwright/test';

test('event endpoint accepts only valid events', async ({ request, baseURL }) => {
	for (const [body, status] of [
		['{"event":"export","value":"neon"}', 204],
		['{"event":"unknown","value":"neon"}', 400],
		['{"event":"export","value":"bad"}', 400]
	] as const) {
		expect(
			(
				await request.post('/api/event', {
					data: body,
					headers: { 'content-type': 'text/plain', origin: baseURL! }
				})
			).status()
		).toBe(status);
	}
	expect((await request.get('/api/event')).ok()).toBe(false);
});
