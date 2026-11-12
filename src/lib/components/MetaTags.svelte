<script lang="ts">
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from '#lib/constants/og.js';
	import {
		OG_IMAGE_URL,
		SITE_DESCRIPTION,
		SITE_NAME,
		SITE_TITLE,
		SITE_URL
	} from '#lib/constants/site.js';
	import { webApplicationSchema } from '#lib/utils/structuredData.js';
	import JsonLd from './JsonLd.svelte';

	const canonicalUrl = `${SITE_URL}/`;
	const imageAlt = `ActiveYear dashboard: Your ${TARGET_YEAR} heading above total distance, elevation, time and calories`;
</script>

<svelte:head>
	<title>{SITE_TITLE}</title>
	<meta name="description" content={SITE_DESCRIPTION} />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<link rel="canonical" href={canonicalUrl} />
	<meta name="theme-color" content="#0a0a0b" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={SITE_TITLE} />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:image" content={OG_IMAGE_URL} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
	<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	<meta property="og:image:alt" content={imageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={SITE_TITLE} />
	<meta name="twitter:description" content={SITE_DESCRIPTION} />
	<meta name="twitter:image" content={OG_IMAGE_URL} />
	<meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>

<JsonLd data={webApplicationSchema()} />
