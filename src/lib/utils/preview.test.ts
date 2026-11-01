import { describe, it, expect } from 'vitest';
import { getPreviewScale } from './preview.js';

describe('getPreviewScale', () => {
	it('caps the scale on wide viewports', () => {
		expect(getPreviewScale(1440, 1080)).toBe(0.35);
	});

	it('fits the card into the viewport minus the mobile padding', () => {
		expect(getPreviewScale(375, 1080)).toBeCloseTo((375 - 48) / 1080);
	});

	it('never lets the preview exceed 400px wide', () => {
		expect(getPreviewScale(1440, 2000)).toBeCloseTo(400 / 2000);
	});
});
