import {
	OG_IMAGE_URL,
	REPOSITORY_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL
} from '#lib/constants/site.js';
import type { FaqItem, JsonLdObject } from '#lib/types/index.js';

/** Renders JSON-LD as a script tag that is safe to insert with `{@html}`. */
export function serializeJsonLd(data: JsonLdObject): string {
	const json = JSON.stringify(data).replaceAll('<', '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}

export function webApplicationSchema(): JsonLdObject {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SITE_NAME,
		url: SITE_URL,
		description: SITE_DESCRIPTION,
		image: OG_IMAGE_URL,
		applicationCategory: 'HealthApplication',
		operatingSystem: 'Any (web browser)',
		browserRequirements: 'Requires JavaScript',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		sameAs: [REPOSITORY_URL]
	};
}

export function faqPageSchema(items: FaqItem[]): JsonLdObject {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(({ question, answer }) => ({
			'@type': 'Question',
			name: question,
			acceptedAnswer: { '@type': 'Answer', text: answer }
		}))
	};
}
