<script lang="ts">
	import type { Snippet } from 'svelte';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import type { CardVariant } from '#lib/types/index.js';
	import ExportPreviewScale from './export/ExportPreviewScale.svelte';
	import ExportCardSurface from './export/ExportCardSurface.svelte';
	import ExportCardBackground from './export/ExportCardBackground.svelte';
	import ExportCardHeader from './export/ExportCardHeader.svelte';
	import ExportCardWatermark from './export/ExportCardWatermark.svelte';

	let {
		variant,
		title,
		headerAside,
		children
	}: {
		variant: CardVariant;
		title: string;
		headerAside?: Snippet;
		children: Snippet;
	} = $props();
</script>

<ExportPreviewScale>
	<ExportCardSurface {variant} theme={exportSettings.theme}>
		<ExportCardBackground theme={exportSettings.theme} />

		<div class="relative z-10 flex h-full flex-col p-[54px]">
			<ExportCardHeader {title} userName={exportSettings.displayName} aside={headerAside} />
			{@render children()}
			<ExportCardWatermark />
		</div>
	</ExportCardSurface>
</ExportPreviewScale>
