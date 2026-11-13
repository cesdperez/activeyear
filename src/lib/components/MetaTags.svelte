<script lang="ts">
	import { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from '#lib/constants/og.js';
	import { LOCALES, OG_LOCALES } from '#lib/constants/locales.js';
	import { OG_IMAGE_URL, SITE_NAME, SITE_URL } from '#lib/constants/site.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { localePath } from '#lib/i18n/locale.js';
	import { webApplicationSchema } from '#lib/utils/structuredData.js';
	import JsonLd from './JsonLd.svelte';

	let canonicalUrl = $derived(`${SITE_URL}${localePath(i18n.locale)}`);
</script>

<svelte:head>
	<title>{i18n.m.meta.title}</title>
	<meta name="description" content={i18n.m.meta.description} />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<link rel="canonical" href={canonicalUrl} />
	{#each LOCALES as locale (locale)}
		<link rel="alternate" hreflang={locale} href={`${SITE_URL}${localePath(locale)}`} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={`${SITE_URL}/`} />
	<meta name="theme-color" content="#0a0a0b" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content={OG_LOCALES[i18n.locale]} />
	{#each LOCALES.filter((locale) => locale !== i18n.locale) as locale (locale)}
		<meta property="og:locale:alternate" content={OG_LOCALES[locale]} />
	{/each}
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={i18n.m.meta.title} />
	<meta property="og:description" content={i18n.m.meta.description} />
	<meta property="og:image" content={OG_IMAGE_URL} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
	<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	<meta property="og:image:alt" content={i18n.m.meta.imageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={i18n.m.meta.title} />
	<meta name="twitter:description" content={i18n.m.meta.description} />
	<meta name="twitter:image" content={OG_IMAGE_URL} />
	<meta name="twitter:image:alt" content={i18n.m.meta.imageAlt} />
</svelte:head>

<JsonLd data={webApplicationSchema(i18n.locale)} />
