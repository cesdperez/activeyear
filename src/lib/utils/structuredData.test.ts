import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from './structuredData.js';

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
