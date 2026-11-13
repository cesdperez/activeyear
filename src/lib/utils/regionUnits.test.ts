import { describe, it, expect } from 'vitest';
import { unitsForLanguages } from './regionUnits.js';

describe('unitsForLanguages', () => {
	it.each([['en-US'], ['es-US'], ['en-LR'], ['my-MM'], ['en-us']])(
		'picks imperial for %s',
		(language) => {
			expect(unitsForLanguages([language])).toBe('imperial');
		}
	);

	it.each([['en-GB'], ['en-CA'], ['es-ES'], ['de'], ['en'], ['zh-Hant-TW']])(
		'picks metric for %s',
		(language) => {
			expect(unitsForLanguages([language])).toBe('metric');
		}
	);

	it('reads the first language that names a region', () => {
		expect(unitsForLanguages(['en', 'en-US', 'en-GB'])).toBe('imperial');
		expect(unitsForLanguages(['nl-NL', 'en-US'])).toBe('metric');
	});

	it('reads the region after a script subtag', () => {
		expect(unitsForLanguages(['en-Latn-US'])).toBe('imperial');
	});

	it('falls back to metric without languages or with malformed tags', () => {
		expect(unitsForLanguages([])).toBe('metric');
		expect(unitsForLanguages(['not a tag'])).toBe('metric');
	});
});
