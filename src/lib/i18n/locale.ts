import { DEFAULT_LOCALE, LOCALES } from '#lib/constants/locales.js';
import type { Locale } from '#lib/types/index.js';

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}
export function localeFromParam(param: string | undefined): Locale {
	return param && isLocale(param) ? param : DEFAULT_LOCALE;
}
export function localeFromPath(pathname: string): Locale {
	const match = /^\/(es|pt|fr|de|nl)\/?$/.exec(pathname);
	return localeFromParam(match?.[1]);
}
export function localePath(locale: Locale): string {
	return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
}
