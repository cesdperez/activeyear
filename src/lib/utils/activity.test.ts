import { describe, it, expect } from 'vitest';
import { consolidateBreakdown } from './activity';
import type { SportBreakdown } from '#lib/types/index.js';

describe('consolidateBreakdown', () => {
	it('should keep sports with duration >= 1 hour', () => {
		const input: SportBreakdown[] = [
			{ type: 'running', distance: 10, duration: 3600, count: 1 },
			{ type: 'cycling', distance: 20, duration: 4000, count: 1 }
		];
		const result = consolidateBreakdown(input);
		expect(result).toHaveLength(2);
		expect(result).toContainEqual(input[0]);
		expect(result).toContainEqual(input[1]);
	});

	it('should consolidate sports with duration < 1 hour into "other"', () => {
		const input: SportBreakdown[] = [
			{ type: 'running', distance: 10, duration: 36000, count: 5 },
			{ type: 'swimming', distance: 1, duration: 1800, count: 1 },
			{ type: 'walking', distance: 2, duration: 1200, count: 1 }
		];
		const result = consolidateBreakdown(input);
		expect(result).toHaveLength(2);
		expect(result).toContainEqual({ type: 'running', distance: 10, duration: 36000, count: 5 });
		expect(result).toContainEqual({
			type: 'other',
			distance: 3,
			duration: 3000,
			count: 2,
			rollup: true
		});
	});

	it('should merge the folded sports with an existing "other" entry', () => {
		const input: SportBreakdown[] = [
			{ type: 'running', distance: 10, duration: 36000, count: 5 },
			{ type: 'swimming', distance: 1, duration: 1800, count: 1 },
			{ type: 'walking', distance: 2, duration: 1200, count: 1 },
			{ type: 'other', distance: 5, duration: 5000, count: 2 }
		];
		const result = consolidateBreakdown(input);
		expect(result).toHaveLength(2);
		expect(result).toContainEqual({ type: 'running', distance: 10, duration: 36000, count: 5 });
		expect(result).toContainEqual({
			type: 'other',
			distance: 8,
			duration: 8000,
			count: 4,
			rollup: true
		});
	});

	it('should not fold so much that "other" outranks a named sport', () => {
		const input: SportBreakdown[] = [
			{ type: 'running', distance: 10, duration: 5400, count: 2 },
			{ type: 'hiking', distance: 8, duration: 4000, count: 1 },
			{ type: 'cycling', distance: 0, duration: 3000, count: 1 },
			{ type: 'swimming', distance: 1, duration: 1800, count: 1 },
			{ type: 'strength', distance: 0, duration: 2700, count: 1 },
			{ type: 'walking', distance: 2, duration: 1200, count: 1 },
			{ type: 'yoga', distance: 0, duration: 2400, count: 1 }
		];
		const result = consolidateBreakdown(input);
		const other = result.find((s) => s.type === 'other');
		for (const named of result.filter((s) => s.type !== 'other')) {
			expect(other?.count ?? 0).toBeLessThanOrEqual(named.count);
			expect(other?.duration ?? 0).toBeLessThanOrEqual(named.duration);
		}
	});

	it('should fold the smallest sports while "other" stays the smallest entry', () => {
		const input: SportBreakdown[] = [
			{ type: 'running', distance: 10, duration: 36000, count: 9 },
			{ type: 'cycling', distance: 50, duration: 18000, count: 4 },
			{ type: 'swimming', distance: 1, duration: 900, count: 1 },
			{ type: 'walking', distance: 2, duration: 1200, count: 1 },
			{ type: 'yoga', distance: 0, duration: 3000, count: 3 }
		];
		expect(consolidateBreakdown(input).map((s) => s.type)).toEqual([
			'running',
			'cycling',
			'yoga',
			'other'
		]);
	});

	it('should return empty array for empty input', () => {
		expect(consolidateBreakdown([])).toEqual([]);
	});

	it('should keep a single short sport named instead of folding it alone', () => {
		const input: SportBreakdown[] = [
			{ type: 'running', distance: 10, duration: 3600, count: 1 },
			{ type: 'swimming', distance: 1, duration: 1800, count: 1 },
			{ type: 'other', distance: 5, duration: 5000, count: 2 }
		];
		expect(consolidateBreakdown(input)).toEqual(input);
	});

	it('should keep a lone short sport named', () => {
		const input: SportBreakdown[] = [{ type: 'running', distance: 4, duration: 1200, count: 1 }];
		expect(consolidateBreakdown(input)).toEqual(input);
	});

	it('should keep only small sports named rather than fold them all into "other"', () => {
		const input: SportBreakdown[] = [
			{ type: 'swimming', distance: 1, duration: 1800, count: 1 },
			{ type: 'walking', distance: 2, duration: 1200, count: 1 }
		];
		expect(consolidateBreakdown(input)).toEqual(input);
	});
});
