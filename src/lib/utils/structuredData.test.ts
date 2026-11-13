import { describe, expect, it } from 'vitest';
import { serializeJsonLd, webApplicationSchema } from './structuredData.js';

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
