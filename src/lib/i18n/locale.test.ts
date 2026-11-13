import { describe, expect, it } from 'vitest';
import { isLocale, localeFromParam, localeFromPath, localePath } from './locale.js';

describe('locale', () => {
	it('validates and defaults', () => {
		expect(isLocale('es')).toBe(true);
		expect(isLocale('invalid')).toBe(false);
		expect(localeFromParam(undefined)).toBe('en');
		expect(localeFromPath('/404')).toBe('en');
		expect(localeFromPath('/de/')).toBe('de');
		expect(localeFromPath('/de/404')).toBe('de');
		expect(localeFromPath('/deutsch/404')).toBe('en');
		expect(localePath('en')).toBe('/');
		expect(localePath('es')).toBe('/es/');
	});
});
