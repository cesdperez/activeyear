import { LOCALES } from '#lib/constants/locales.js';
import { SITE_URL } from '#lib/constants/site.js';
import { localePath } from '#lib/i18n/locale.js';

export const prerender = true;

export function GET(): Response {
	const alternates = [
		...LOCALES.map(
			(locale) =>
				`<xhtml:link rel="alternate" hreflang="${locale}" href="${SITE_URL}${localePath(locale)}" />`
		),
		`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`
	].join('\n\t\t');
	const urls = LOCALES.map(
		(locale) =>
			`\t<url>\n\t\t<loc>${SITE_URL}${localePath(locale)}</loc>\n\t\t${alternates}\n\t</url>`
	).join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
