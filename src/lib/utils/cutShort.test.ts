import { describe, expect, it } from 'vitest';
import { parseGarminCsv } from '#lib/parsers/garmin.js';
import { cutShortFrom } from './cutShort.js';

const year = 2026;
function result(count: number, date = `${year}-03-01`, prior = false) {
	const rows = Array.from(
		{ length: count },
		(_, i) => `Running,${prior && i === 0 ? `${year - 1}-12-31` : date} 08:00:00,10`
	);
	return parseGarminCsv(['Activity Type,Date,Distance', ...rows].join('\n'), year);
}
describe('cutShortFrom', () => {
	it.each([20, 40])('warns for %i rows starting in March', (count) => {
		expect(cutShortFrom(result(count), year)).toEqual(new Date(year, 2, 1, 8));
	});
	it('does not warn when a prior year is present', () =>
		expect(cutShortFrom(result(20, undefined, true), year)).toBeNull());
	it('does not warn for an incomplete page', () =>
		expect(cutShortFrom(result(23), year)).toBeNull());
	it('does not warn for early January', () =>
		expect(cutShortFrom(result(20, `${year}-01-03`), year)).toBeNull());
	it('does not warn for Strava', () =>
		expect(cutShortFrom({ ...result(20), source: 'strava' }, year)).toBeNull());
	it('does not warn on January 14 or an empty file', () => {
		expect(cutShortFrom(result(20, `${year}-01-14`), year)).toBeNull();
		expect(cutShortFrom(result(0), year)).toBeNull();
	});
});
