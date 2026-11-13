import { describe, it, expect } from 'vitest';
import { decodeText } from './decodeText.js';

describe('decodeText', () => {
	it('reads UTF-8', () => {
		expect(decodeText(new TextEncoder().encode('Calorías,Natación'))).toBe('Calorías,Natación');
	});

	it('reads Windows-1252 when the bytes are not valid UTF-8', () => {
		const bytes = Uint8Array.from([0x43, 0x61, 0x6c, 0x6f, 0x72, 0xed, 0x61, 0x73, 0x80]);
		expect(decodeText(bytes)).toBe('Calorías€');
	});
});
