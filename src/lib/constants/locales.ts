import type { Locale } from '#lib/types/index.js';

export const LOCALES = ['en', 'es', 'pt', 'fr', 'de', 'nl'] as const;
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'activeyear.locale';
export const LOCALE_NAMES: Record<Locale, string> = {
	en: 'English',
	es: 'Español',
	pt: 'Português',
	fr: 'Français',
	de: 'Deutsch',
	nl: 'Nederlands'
};
export const INTL_LOCALES: Record<Locale, string> = {
	en: 'en-US',
	es: 'es-ES',
	pt: 'pt-BR',
	fr: 'fr-FR',
	de: 'de-DE',
	nl: 'nl-NL'
};
export const OG_LOCALES: Record<Locale, string> = {
	en: 'en_US',
	es: 'es_ES',
	pt: 'pt_BR',
	fr: 'fr_FR',
	de: 'de_DE',
	nl: 'nl_NL'
};
