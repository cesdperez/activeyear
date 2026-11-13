import { REPOSITORY_URL, SITE_NAME, SITE_URL } from '#lib/constants/site.js';
import { LOCALES } from '#lib/constants/locales.js';
import { TARGET_YEAR } from '#lib/constants/time.js';
import { faqItems } from '#lib/data/faq.js';
import { garminExportNote, garminExportSteps } from '#lib/data/garminExport.js';
import { stravaExportNote, stravaExportSteps } from '#lib/data/stravaExport.js';
import { localeFromParam, localePath } from '#lib/i18n/locale.js';
import { MESSAGES } from '#lib/i18n/messages/index.js';
import type { ExportStep } from '#lib/types/index.js';
import type { RequestHandler } from './$types.js';

export const prerender = true;
export const entries = () => [
	{},
	...LOCALES.filter((lang) => lang !== 'en').map((lang) => ({ lang }))
];

export const GET: RequestHandler = ({ params }) => {
	const locale = localeFromParam(params.lang);
	const { description, llms } = MESSAGES[locale].meta;
	const url = locale === 'en' ? SITE_URL : `${SITE_URL}${localePath(locale)}`;
	const numbered = (steps: ExportStep[]) =>
		steps.map(({ text, link }, i) => `${i + 1}. ${link ? `${text} ${link.href}` : text}`);
	const exportSteps = numbered(garminExportSteps(locale));
	const stravaSteps = numbered(stravaExportSteps(locale));
	const appSteps = [llms.open.replace('URL', url), llms.download].map(
		(step, i) => `${exportSteps.length + i + 1}. ${step}`
	);
	const faq = faqItems(locale)
		.map(({ question, answer }) => `### ${question}\n\n${answer}`)
		.join('\n\n');
	const languages =
		locale === 'en'
			? `${llms.otherLanguages}: ${LOCALES.filter((lang) => lang !== 'en')
					.map((lang) => `${SITE_URL}${localePath(lang)}llms.txt`)
					.join(', ')}`
			: `${llms.english}: ${SITE_URL}/llms.txt`;
	const body = `# ${SITE_NAME}

> ${description}

${llms.intro.replace('URL', url).replace('YEAR', String(TARGET_YEAR))}

${llms.bullets.map((bullet) => `- ${bullet}`).join('\n')}

## ${llms.garminHeading}

${[...exportSteps, ...appSteps].join('\n')}

${garminExportNote(locale)}

## ${llms.stravaHeading}

${stravaSteps.join('\n')}

${stravaExportNote(locale)}

## ${llms.faqHeading}

${faq}

## ${llms.linksHeading}

- [${SITE_NAME}](${locale === 'en' ? `${url}/` : url}): ${llms.appLabel}
- [${llms.sourceLabel}](${REPOSITORY_URL}): ${llms.sourceDescription}
- ${languages}
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
