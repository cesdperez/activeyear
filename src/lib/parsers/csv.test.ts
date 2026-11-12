import { describe, it, expect } from 'vitest';
import { isInYear } from './csv.js';

describe('isInYear', () => {
	it('returns true for matching year', () => {
		expect(isInYear(new Date('2025-06-15'), 2025)).toBe(true);
	});

	it('returns false for different year', () => {
		expect(isInYear(new Date('2024-12-31'), 2025)).toBe(false);
	});
});
