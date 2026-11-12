import { describe, expect, it } from 'vitest';
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
	it('describes a free web app at the canonical URL', () => {
		const schema = webApplicationSchema();

		expect(schema['@type']).toBe('WebApplication');
		expect(schema.url).toBe('https://activeyear.app');
		expect(schema.offers).toMatchObject({ price: '0', priceCurrency: 'USD' });
	});
});

describe('faqPageSchema', () => {
	it('maps each item to a question with an accepted answer', () => {
		const schema = faqPageSchema([{ question: 'Is it free?', answer: 'Yes.' }]);

		expect(schema.mainEntity).toEqual([
			{
				'@type': 'Question',
				name: 'Is it free?',
				acceptedAnswer: { '@type': 'Answer', text: 'Yes.' }
			}
		]);
	});
});
