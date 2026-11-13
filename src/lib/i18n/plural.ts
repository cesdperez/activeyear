import { INTL_LOCALES } from '#lib/constants/locales.js';
import type { Locale } from '#lib/types/index.js';

export function plural(
	locale: Locale,
	count: number,
	forms: { one: string; other: string }
): string {
	return new Intl.PluralRules(INTL_LOCALES[locale]).select(count) === 'one'
		? forms.one
		: forms.other;
}
