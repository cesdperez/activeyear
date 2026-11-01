import { describe, it, expect } from 'vitest';
import { exportFileStem } from './export.js';

describe('exportFileStem', () => {
	it.each([
		['', 'activeyear-2026'],
		['Ana', 'ana-2026'],
		['Ana   María', 'ana-maría-2026']
	])('names the files for %j as %j', (name, stem) => {
		expect(exportFileStem(name, 2026)).toBe(stem);
	});
});
