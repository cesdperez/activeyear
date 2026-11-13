import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const environment = vi.hoisted(() => ({ browser: true, dev: false }));
vi.mock('$app/env', () => environment);
import { track } from './track.js';

describe('track', () => {
	const sendBeacon = vi.fn();

	beforeEach(() => {
		environment.browser = true;
		environment.dev = false;
		sendBeacon.mockReset();
		vi.stubGlobal('navigator', { webdriver: false, sendBeacon });
	});

	afterEach(() => vi.unstubAllGlobals());

	it('sends the event as a plain string', () => {
		track('theme_selected', 'retro');
		expect(sendBeacon).toHaveBeenCalledWith(
			'/api/event',
			JSON.stringify({ event: 'theme_selected', value: 'retro' })
		);
	});

	it('does not send in webdriver', () => {
		vi.stubGlobal('navigator', { webdriver: true, sendBeacon });
		track('more_stats_opened', '');
		expect(sendBeacon).not.toHaveBeenCalled();
	});

	it('does not send in development', () => {
		environment.dev = true;
		track('more_stats_opened', '');
		expect(sendBeacon).not.toHaveBeenCalled();
	});

	it('does not send outside the browser', () => {
		environment.browser = false;
		track('more_stats_opened', '');
		expect(sendBeacon).not.toHaveBeenCalled();
	});

	it('swallows a failing or missing sendBeacon', () => {
		sendBeacon.mockImplementation(() => {
			throw new Error('blocked');
		});
		expect(() => track('more_stats_opened', '')).not.toThrow();
		vi.stubGlobal('navigator', { webdriver: false });
		expect(() => track('more_stats_opened', '')).not.toThrow();
	});
});
