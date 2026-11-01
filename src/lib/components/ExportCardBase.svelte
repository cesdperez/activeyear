<script lang="ts">
	import type { Snippet } from 'svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
	import type { CardVariant } from '#lib/types/index.js';
	import ExportPreviewScale from './export/ExportPreviewScale.svelte';
	import ExportCardSurface from './export/ExportCardSurface.svelte';
	import ExportCardBackground from './export/ExportCardBackground.svelte';
	import ExportCardHeader from './export/ExportCardHeader.svelte';
	import ExportCardWatermark from './export/ExportCardWatermark.svelte';

	let {
		variant,
		title,
		children
	}: {
		variant: CardVariant;
		title: string;
		children: Snippet;
	} = $props();
</script>

<ExportPreviewScale>
	<ExportCardSurface {variant} theme={appStore.theme}>
		<ExportCardBackground theme={appStore.theme} />

		<div class="relative z-10 flex h-full flex-col p-14">
			<ExportCardHeader {title} userName={appStore.userName} />
			{@render children()}
			<ExportCardWatermark />
		</div>
	</ExportCardSurface>
</ExportPreviewScale>
