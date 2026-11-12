import { SITE_URL } from '#lib/constants/site.js';

export const prerender = true;

// The `*` group already allows these; naming them keeps them allowed if `*` ever gains a Disallow.
const AI_CRAWLERS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'anthropic-ai',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'Meta-ExternalAgent',
	'Amazonbot',
	'CCBot',
	'DuckAssistBot',
	'MistralAI-User',
	'cohere-ai'
];

export function GET(): Response {
	const groups = ['*', ...AI_CRAWLERS].map((agent) => `User-agent: ${agent}\nAllow: /`);
	const body = [...groups, `Sitemap: ${SITE_URL}/sitemap.xml`].join('\n\n') + '\n';
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
