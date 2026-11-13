import { describe, it, expect } from 'vitest';
import { flipShadowY } from './shadow.js';

describe('flipShadowY', () => {
	it('negates the vertical offset of a computed box shadow', () => {
		expect(flipShadowY('rgb(0, 0, 0) 8px 8px 0px 0px')).toBe('rgb(0, 0, 0) 8px -8px 0px 0px');
	});

	it('turns a negative offset positive', () => {
		expect(flipShadowY('rgba(0, 0, 0, 0.3) 8px -8.5px 0px')).toBe(
			'rgba(0, 0, 0, 0.3) 8px 8.5px 0px'
		);
	});

	it('flips every shadow in a list, inset ones included', () => {
		expect(flipShadowY('rgb(1, 2, 3) 4px 4px 0px, inset rgb(0, 0, 0) 0px 2px 0px 1px')).toBe(
			'rgb(1, 2, 3) 4px -4px 0px, inset rgb(0, 0, 0) 0px -2px 0px 1px'
		);
	});

	it('leaves a shadow without offsets alone', () => {
		expect(flipShadowY('none')).toBe('none');
		expect(flipShadowY('rgba(0, 255, 0, 0.5) 0px 0px 30px')).toBe(
			'rgba(0, 255, 0, 0.5) 0px 0px 30px'
		);
	});
});
