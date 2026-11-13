import { describe, it, expect } from 'vitest';
import { exportFileStem, nameFontSize, timelineGap } from './export.js';

describe('exportFileStem', () => {
	it.each([
		['', 'activeyear-2026'],
		['Ana', 'ana-2026'],
		['Ana   María', 'ana-maria-2026'],
		['山田', 'activeyear-2026']
	])('names the files for %j as %j', (name, stem) => {
		expect(exportFileStem(name, 2026)).toBe(stem);
	});
});

describe('nameFontSize', () => {
	it('keeps short names large and shrinks long ones', () => {
		expect(nameFontSize('Ana')).toBe(42);
		expect(nameFontSize('Wolfgang Amadeus Mozart')).toBe(32);
	});
});

describe('timelineGap', () => {
	it('spreads the free height between the items', () => {
		expect(timelineGap(1000, 600, 5)).toBe(100);
	});

	it.each([
		['packed', 1000, 990, 5, 32],
		['sparse', 1000, 200, 2, 160],
		['single', 1000, 200, 1, 32]
	])('clamps a %s list', (_, available, items, count, gap) => {
		expect(timelineGap(available, items, count)).toBe(gap);
	});
});
