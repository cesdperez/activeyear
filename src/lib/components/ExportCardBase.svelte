<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CardVariant, Theme } from '#lib/types/index.js';
	import ExportPreviewScale from './export/ExportPreviewScale.svelte';
	import ExportCardSurface from './export/ExportCardSurface.svelte';
	import ExportCardBackground from './export/ExportCardBackground.svelte';
	import ExportCardHeader from './export/ExportCardHeader.svelte';
	import ExportCardWatermark from './export/ExportCardWatermark.svelte';

	let {
		theme,
		displayName,
		yearSoFar,
		variant,
		title,
		headerAside,
		children
	}: {
		theme: Theme;
		displayName: string;
		yearSoFar: boolean;
		variant: CardVariant;
		title: string;
		headerAside?: Snippet;
		children: Snippet;
	} = $props();
</script>

<ExportPreviewScale>
	<ExportCardSurface {variant} {theme}>
		<ExportCardBackground {theme} />

		<div class="relative z-10 flex h-full flex-col p-[54px]">
			<ExportCardHeader {title} userName={displayName} {theme} {yearSoFar} aside={headerAside} />
			{@render children()}
			<ExportCardWatermark {theme} />
		</div>
	</ExportCardSurface>
</ExportPreviewScale>
