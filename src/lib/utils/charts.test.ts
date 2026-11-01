import { describe, it, expect } from 'vitest';
import { topIndices, scaledBarHeight, donutSegments } from './charts.js';

describe('topIndices', () => {
	it('returns the indices of the largest values, largest first', () => {
		expect(topIndices([3, 9, 1, 7], 2)).toEqual([1, 3]);
	});

	it('includes every value tied with the last one picked', () => {
		expect(topIndices([5, 2, 5, 5], 2)).toEqual([0, 2, 3]);
		expect(topIndices([3, 1, 1, 1, 1, 3, 3], 2)).toEqual([0, 5, 6]);
		expect(topIndices([200, 100, 169, 169, 1], 2)).toEqual([0, 2, 3]);
	});

	it('returns every index when there are fewer values than requested', () => {
		expect(topIndices([4], 2)).toEqual([0]);
	});

	it('never picks a zero value', () => {
		expect(topIndices([0, 0, 3, 0], 2)).toEqual([2]);
		expect(topIndices([0, 0], 2)).toEqual([]);
	});
});

describe('scaledBarHeight', () => {
	it('scales the value against the max to the container height', () => {
		expect(scaledBarHeight(5, 10, 160, 8)).toBe(80);
	});

	it('never goes below the minimum height', () => {
		expect(scaledBarHeight(0, 10, 160, 8)).toBe(8);
	});

	it('fills the container at the max value', () => {
		expect(scaledBarHeight(10, 10, 160, 8)).toBe(160);
	});
});

describe('donutSegments', () => {
	const circumference = 100;

	it('gives each value its share of the total', () => {
		const segments = donutSegments([1, 3], circumference);

		expect(segments.map((s) => s.share)).toEqual([0.25, 0.75]);
	});

	it('starts each segment where the previous ones end', () => {
		const segments = donutSegments([1, 1, 2], circumference);

		expect(segments.map((s) => s.offset)).toEqual([0, 25, 50]);
	});

	it('returns no segments for no values', () => {
		expect(donutSegments([], circumference)).toEqual([]);
	});
});
