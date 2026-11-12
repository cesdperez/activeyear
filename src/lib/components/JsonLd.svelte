<script lang="ts">
	import type { JsonLdObject } from '#lib/types/index.js';
	import { serializeJsonLd } from '#lib/utils/structuredData.js';

	let { data }: { data: JsonLdObject } = $props();
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- serializeJsonLd escapes the JSON -->
	{@html serializeJsonLd(data)}
</svelte:head>
