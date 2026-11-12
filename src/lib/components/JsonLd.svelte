<script lang="ts">
	import { serializeJsonLd } from '#lib/utils/structuredData.js';

	let { data }: { data: Record<string, unknown> } = $props();
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- serializeJsonLd escapes the JSON -->
	{@html serializeJsonLd(data)}
</svelte:head>
