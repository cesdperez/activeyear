import { localeFromParam } from '#lib/i18n/locale.js';
import { loadMessages } from '#lib/i18n/messages/index.js';
import type { LayoutLoad } from './$types.js';

export const prerender = true;

export const load: LayoutLoad = async ({ params }) => {
	await loadMessages(localeFromParam(params.lang));
};
