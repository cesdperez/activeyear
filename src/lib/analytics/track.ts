import { browser, dev } from '$app/env';
import type { EventName, EventValue } from '#lib/constants/events.js';

export function track<E extends EventName>(event: E, value: EventValue<E>) {
	try {
		// Playwright runs against a production preview, so webdriver disables E2E events.
		if (!browser || dev || navigator.webdriver) return;
		navigator.sendBeacon('/api/event', JSON.stringify({ event, value }));
	} catch {
		// Analytics must never interrupt the user flow.
	}
}
