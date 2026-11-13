import { ogImageFile } from './og.js';
import type { Locale } from '#lib/types/index.js';

export const SITE_URL = 'https://activeyear.app';
export const KOFI_URL = 'https://ko-fi.com/chechoxyz';
export const SITE_NAME = 'ActiveYear';
export const REPOSITORY_URL = 'https://github.com/cesdperez/activeyear';

export function ogImageUrl(locale: Locale): string {
	return `${SITE_URL}/${ogImageFile(locale)}`;
}
