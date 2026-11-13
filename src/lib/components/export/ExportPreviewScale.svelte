<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getExportDimensions } from '#lib/utils/export.js';
	import { getPreviewScale } from '#lib/utils/preview.js';
	import { PREVIEW_MAX_SCALE } from '#lib/constants/preview.js';

	// Vertical space the carousel nav, slide label and panel padding take around the card.
	const PREVIEW_CHROME_HEIGHT = 200;
	const PREVIEW_MIN_SCALE = 0.08;

	let { children }: { children: Snippet } = $props();

	let dimensions = $derived(getExportDimensions());

	let scale = $state(PREVIEW_MAX_SCALE);

	$effect(() => {
		if (typeof window === 'undefined') return;

		// Sized from the viewport only, so the controls beside it never move with the card.
		function updateScale() {
			const fitToWidth = getPreviewScale(window.innerWidth, dimensions.width);
			const fitToHeight = (window.innerHeight - PREVIEW_CHROME_HEIGHT) / dimensions.height;
			scale = Math.max(PREVIEW_MIN_SCALE, Math.min(fitToWidth, fitToHeight));
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
