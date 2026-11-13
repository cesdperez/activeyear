import { DEFAULT_LOCALE, LOCALES, ROUTED_LOCALES } from '#lib/constants/locales.js';
import type { Locale } from '#lib/types/index.js';

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}
export function localeFromParam(param: string | undefined): Locale {
	return param && isLocale(param) ? param : DEFAULT_LOCALE;
}
export function localeFromPath(pathname: string): Locale {
	const match = /^\/([^/]+)(?:\/|$)/.exec(pathname);
	const locale = match?.[1];
	return locale && (ROUTED_LOCALES as readonly string[]).includes(locale)
		? localeFromParam(locale)
		: DEFAULT_LOCALE;
}
export function localePath(locale: Locale): string {
	return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
}
