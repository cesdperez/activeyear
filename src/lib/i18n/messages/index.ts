import type { Locale, Messages } from '#lib/types/index.js';

const loaders: Record<Locale, () => Promise<Messages>> = {
	en: () => import('./en/index.js').then((module) => module.en),
	es: () => import('./es/index.js').then((module) => module.es),
	pt: () => import('./pt/index.js').then((module) => module.pt),
	fr: () => import('./fr/index.js').then((module) => module.fr),
	de: () => import('./de/index.js').then((module) => module.de),
	nl: () => import('./nl/index.js').then((module) => module.nl)
};

const cache: Partial<Record<Locale, Messages>> = {};

export async function loadMessages(locale: Locale): Promise<Messages> {
	return (cache[locale] ??= await loaders[locale]());
}

export function messages(locale: Locale): Messages {
	const catalog = cache[locale];
	if (!catalog) throw new Error(`Messages for ${locale} are not loaded`);
	return catalog;
}
