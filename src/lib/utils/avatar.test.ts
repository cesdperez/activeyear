import { describe, it, expect } from 'vitest';
import { avatarSize } from './avatar.js';

describe('avatarSize', () => {
	it('shrinks a landscape photo until its short side is the limit', () => {
		expect(avatarSize(4000, 3000, 640)).toEqual({ width: 853, height: 640 });
	});

	it('shrinks a portrait photo the same way', () => {
		expect(avatarSize(3024, 4032, 640)).toEqual({ width: 640, height: 853 });
	});

	it('keeps a photo that is already small enough', () => {
		expect(avatarSize(500, 800, 640)).toEqual({ width: 500, height: 800 });
	});
});
