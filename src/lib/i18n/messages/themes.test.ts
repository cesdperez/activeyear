import { describe, expect, it } from 'vitest';
import { LOCALES } from '#lib/constants/locales.js';
import { THEME_OPTIONS } from '#lib/constants/export.js';
import { messages } from './index.js';

describe.each(LOCALES)('%s copy about the card themes', (locale) => {
	const { faq, meta } = messages(locale);
	const sharing = faq.items[3].answer;
	const outputBullet = meta.llms.bullets.find((bullet) => bullet.includes('1080 × 1920'));

	it.each(THEME_OPTIONS.map(({ label }) => label))('names %s', (label) => {
		expect(sharing).toContain(label);
		expect(outputBullet).toContain(label);
	});
});
