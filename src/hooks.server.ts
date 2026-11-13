import type { Handle } from '@sveltejs/kit/hooks';
import { localeFromPath } from '#lib/i18n/locale.js';

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', localeFromPath(event.url.pathname))
	});
