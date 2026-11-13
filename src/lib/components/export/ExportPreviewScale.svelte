<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getExportDimensions } from '#lib/utils/export.js';
	import { getPreviewScale } from '#lib/utils/preview.js';
	import { PREVIEW_MAX_SCALE } from '#lib/constants/preview.js';

	// The same breakpoint that puts the controls beside the preview in ExportPanel.
	const TWO_COLUMN_QUERY = '(min-width: 64rem)';

	let { children }: { children: Snippet } = $props();

	let dimensions = $derived(getExportDimensions());

	let scale = $state(PREVIEW_MAX_SCALE);

	// The largest viewport height, so a phone's URL bar showing or hiding does not resize the card.
	function largeViewportHeight(): number {
		const probe = document.createElement('div');
		probe.style.cssText = 'position: fixed; top: 0; height: 100lvh; visibility: hidden;';
		document.body.append(probe);
		const height = probe.offsetHeight;
		probe.remove();
		return Math.max(height, window.innerHeight);
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		let lastWidth = 0;

		// Sized from the viewport only, so the controls beside it never move with the card.
		function updateScale() {
			const width = window.innerWidth;
			if (width === lastWidth && matchMedia('(pointer: coarse)').matches) return;
			lastWidth = width;
			scale = getPreviewScale(
				{
					width,
					height: largeViewportHeight(),
					twoColumn: matchMedia(TWO_COLUMN_QUERY).matches
				},
				dimensions
			);
		}

		updateScale();
		window.addEventListener('resize', updateScale);
		return () => window.removeEventListener('resize', updateScale);
	});

	let scaledWidth = $derived(dimensions.width * scale);
	let scaledHeight = $derived(dimensions.height * scale);
</script>

<div class="export-card-wrapper" style="width: {scaledWidth}px; height: {scaledHeight}px;">
	<div
		style="width: {dimensions.width}px; height: {dimensions.height}px; transform: scale({scale}); transform-origin: top left;"
	>
		{@render children()}
	</div>
</div>

<style>
	.export-card-wrapper {
		margin-left: auto;
		margin-right: auto;
	}
</style>
