import { describe, expect, it } from 'vitest';
import { faqItems } from '#lib/data/faq.js';
import { faqPageSchema, serializeJsonLd, webApplicationSchema } from './structuredData.js';

describe('serializeJsonLd', () => {
	it('wraps the data in a JSON-LD script tag', () => {
		expect(serializeJsonLd({ a: 1 })).toBe('<script type="application/ld+json">{"a":1}</script>');
	});

	it('escapes < so a string cannot close the script tag', () => {
		const html = serializeJsonLd({ text: '</script><script>alert(1)</script>' });

		expect(html.match(/<\/script>/g)).toHaveLength(1);
		const json = html.slice(html.indexOf('>') + 1, html.lastIndexOf('<'));
		expect(JSON.parse(json).text).toBe('</script><script>alert(1)</script>');
	});
});

describe('webApplicationSchema', () => {
	it('uses the locale URL, language and description', () => {
		expect(webApplicationSchema('de')).toMatchObject({
			url: 'https://activeyear.app/de/',
			inLanguage: 'de',
			description: expect.stringContaining('Jahresrückblick')
		});
	});
});

describe('faqPageSchema', () => {
	it('uses the answer text without additions', () => {
		const schema = faqPageSchema(faqItems('en'));
		expect(schema.mainEntity).toContainEqual({
			'@type': 'Question',
			name: 'Is it free?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Yes. No sign-up, no ads, and the code is open source on GitHub.'
			}
		});
	});
});
