import { describe, expect, it } from 'vitest';
import { activityCountBucket, parseEvent, sportsCountBucket } from './events.js';

describe('parseEvent', () => {
	const values = {
		upload_success: ['1-10', '11-50', '51-200', '200+'],
		upload_error: [
			'unsupported-file-type',
			'unsupported-format',
			'rows-rejected',
			'no-activities-in-year',
			'invalid-saved-year',
			'read-failed'
		],
		theme_selected: ['neon', 'minimalist', 'retro'],
		export: ['neon', 'minimalist', 'retro'],
		more_stats_opened: [''],
		sports_count: ['1', '2', '3-5', '6+']
	};
	for (const [event, allowed] of Object.entries(values)) {
		it(`accepts allowed values for ${event}`, () => {
			for (const value of allowed)
				expect(parseEvent(JSON.stringify({ event, value }))).toEqual({ ok: true, event, value });
		});
		it(`rejects wrong values for ${event}`, () => {
			for (const value of ['bad', null, 2, event === 'sports_count' ? 'neon' : '3-5'])
				expect(parseEvent(JSON.stringify({ event, value })).ok).toBe(false);
		});
	}
	it('accepts omitted value only for more_stats_opened', () => {
		expect(parseEvent('{"event":"more_stats_opened"}')).toEqual({
			ok: true,
			event: 'more_stats_opened',
			value: ''
		});
		expect(parseEvent('{"event":"export"}').ok).toBe(false);
	});
	it.each([
		'not json',
		'{}',
		'null',
		'[]',
		'{"event":"unknown","value":""}',
		'{"event":"export","value":"neon","extra":1}',
		' '.repeat(257)
	])('rejects invalid input', (body) => {
		expect(parseEvent(body).ok).toBe(false);
	});
});

describe('count buckets', () => {
	it.each([
		[1, '1-10'],
		[10, '1-10'],
		[11, '11-50'],
		[50, '11-50'],
		[51, '51-200'],
		[200, '51-200'],
		[201, '200+']
	])('buckets %i activities', (count, bucket) => expect(activityCountBucket(count)).toBe(bucket));
	it.each([
		[1, '1'],
		[2, '2'],
		[3, '3-5'],
		[5, '3-5'],
		[6, '6+']
	])('buckets %i sports', (count, bucket) => expect(sportsCountBucket(count)).toBe(bucket));
});
