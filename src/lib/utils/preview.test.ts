import { describe, it, expect } from 'vitest';
import { getPreviewScale } from './preview.js';

const CARD = { width: 1080, height: 1920 };

describe('getPreviewScale', () => {
	it('caps the scale on a tall two-column viewport', () => {
		expect(getPreviewScale({ width: 1440, height: 1200, twoColumn: true }, CARD)).toBe(0.35);
	});

	it('fits the card beside the controls into the viewport height', () => {
		expect(getPreviewScale({ width: 1280, height: 720, twoColumn: true }, CARD)).toBeCloseTo(
			(720 - 200) / 1920
		);
	});

	it('leaves room under a stacked preview for the theme picker', () => {
		expect(getPreviewScale({ width: 390, height: 844, twoColumn: false }, CARD)).toBeCloseTo(
			(844 * 0.55) / 1920
		);
	});

	it('fits the card into the viewport width minus the mobile padding', () => {
		expect(getPreviewScale({ width: 320, height: 1400, twoColumn: false }, CARD)).toBeCloseTo(
			(320 - 48) / 1080
		);
	});

	it('keeps the card at least 240px wide on a short viewport', () => {
		expect(getPreviewScale({ width: 844, height: 390, twoColumn: false }, CARD)).toBeCloseTo(
			240 / 1080
		);
	});

	it('never lets the preview exceed 400px wide', () => {
		expect(
			getPreviewScale({ width: 1440, height: 2000, twoColumn: true }, { width: 2000, height: 2000 })
		).toBeCloseTo(400 / 2000);
	});
});
