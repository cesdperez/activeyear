<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getExportDimensions } from '#lib/utils/export.js';
	import type { CardVariant, Theme } from '#lib/types/index.js';

	let {
		variant,
		theme,
		children
	}: {
		variant: CardVariant;
		theme: Theme;
		children: Snippet;
	} = $props();

	let dimensions = $derived(getExportDimensions());
</script>

<div
	class="export-card theme-{theme}"
	id="export-card"
	data-theme={theme}
	data-variant={variant}
	style="width: {dimensions.width}px; height: {dimensions.height}px;"
>
	{@render children()}
</div>

<style>
	/* Sizes are 1080px-canvas pixels. VT323 and Press Start 2P draw smaller and wider than the
	   condensed display font, so Retro rescales text and swaps the title sizes. */
	.export-card {
		--font-label: var(--font-text);
		--label-size: 24px;
		--label-tracking: 0.01em;
		--text-scale: 1;
		--stat-scale: 1;
		--name-scale: 1.25;
		--title-size: 120px;
		--heading-size: 40px;
		--round: 9999px;
		--panel-radius: 8px;
		--panel-border-width: 1px;
		--panel-shadow: none;
		--hero-shadow: 0 0 30px var(--color-accent-glow);

		background: var(--color-surface);
		color: var(--color-text-primary);
		font-family: var(--font-text);
		position: relative;
		overflow: hidden;
	}

	.theme-classic,
	.theme-synthwave {
		--title-size: 90px;
	}

	.theme-classic[data-variant='summary'],
	.theme-synthwave[data-variant='summary'] {
		--stat-scale: 0.75;
		--summary-avatar-size: 280px;
		--summary-avatar-margin: 8px;
		--summary-lane-margin: 18px;
		--summary-results-padding: 12px;
		--summary-result-padding: 10px;
	}

	.theme-synthwave {
		--avatar-border: #ff00cc;
		--avatar-decoration: #ff00cc;
		--avatar-radius: 20%;
		--avatar-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3);
	}

	.theme-minimalist {
		--hero-shadow: none;
	}

	.theme-retro {
		--font-label: var(--font-display);
		--label-size: 16px;
		--label-tracking: 0;
		--text-scale: 1.4;
		--stat-scale: 1.3;
		--name-scale: 2.1;
		--title-size: 52px;
		--heading-size: 22px;
		--round: 0;
		--panel-radius: 0;
		--panel-border-width: 4px;
		--panel-shadow: 8px 8px 0 #000;
		--hero-shadow: 4px 4px 0 #000;

		font-synthesis: none;
	}

	:global(.export-card .stat-value) {
		font-feature-settings: 'tnum';
	}

	:global(.export-card .card-label) {
		font-family: var(--font-label);
		font-size: var(--label-size);
		font-weight: 500;
		letter-spacing: var(--label-tracking);
		line-height: 1.3;
	}

	:global(.export-card .card-text-sm),
	:global(.export-card .card-text-md),
	:global(.export-card .card-text-lg) {
		line-height: 1.25;
	}

	:global(.export-card .card-text-sm) {
		font-size: calc(24px * var(--text-scale));
	}

	:global(.export-card .card-text-md) {
		font-size: calc(30px * var(--text-scale));
	}

	:global(.export-card .card-text-lg) {
		font-size: calc(36px * var(--text-scale));
	}

	:global(.export-card .hero-value) {
		text-shadow: var(--hero-shadow);
	}

	:global(.export-card .fun-fact) {
		font-size: calc(26px * var(--text-scale));
	}

	:global(.export-card .panel) {
		background: var(--color-surface-elevated);
		border: var(--panel-border-width) solid var(--color-border);
		border-radius: var(--panel-radius);
		box-shadow: var(--panel-shadow);
	}

	:global(.export-card .avatar-container) {
		width: 200px;
		height: 200px;
		flex-shrink: 0;
		background: var(--color-surface-elevated);
		border: 4px solid var(--color-accent);
		border-radius: var(--round);
		box-shadow: var(--panel-shadow);
		overflow: hidden;
	}

	:global(.export-card .donut-bg) {
		stroke: var(--color-border);
	}

	:global(.export-card .timeline-line) {
		background: var(--color-border);
	}

	:global(.export-card .timeline-node) {
		background: var(--color-surface);
		border: 4px solid var(--color-accent);
		border-radius: var(--round);
	}

	:global(.export-card .timeline-node > div) {
		border-radius: var(--round);
	}
</style>
