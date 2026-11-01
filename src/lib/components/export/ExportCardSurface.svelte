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
	.export-card {
		background: var(--color-surface);
		position: relative;
		overflow: hidden;
		font-family: 'Outfit', system-ui, sans-serif;
	}

	.theme-minimalist :global(.stat-value) {
		color: #000 !important;
	}

	.theme-minimalist :global(.text-\[var\(--color-text-primary\)\]) {
		color: #111 !important;
	}

	.theme-minimalist :global(.text-\[var\(--color-text-muted\)\]) {
		color: #666 !important;
	}

	.theme-minimalist :global(.text-\[var\(--color-text-dim\)\]) {
		color: #999 !important;
	}

	:global(.stat-value) {
		font-feature-settings: 'tnum';
		font-variant-numeric: tabular-nums;
	}

	/* Avatar Container */
	:global(.avatar-container) {
		width: 400px;
		height: 400px;
		border-radius: 9999px;
		background: var(--color-surface-elevated);
		border: 4px solid var(--color-accent);
		box-shadow: 0 0 30px var(--color-accent-glow);
		padding: 4px;
		overflow: hidden;
		position: relative;
		z-index: 20;
	}

	.theme-minimalist :global(.avatar-container) {
		background: #fff;
		border: 4px solid #000;
		box-shadow: none;
	}

	.theme-retro :global(.avatar-container) {
		background: #2e2660;
		border: 6px solid #ff00cc;
		box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.3);
		border-radius: 20%;
	}

	.theme-retro :global(.avatar-container img) {
		border-radius: 8%;
	}

	/* Avatar Decorations & Spirals */
	:global(.avatar-decorations) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.spiral-svg) {
		width: 650px;
		height: 650px;
		overflow: visible;
		transform: rotate(-15deg);
		flex-shrink: 0;
	}

	:global(.spiral-path) {
		fill: none;
		stroke: var(--color-accent);
		stroke-linecap: round;
		opacity: 0.3;
		transition: stroke 0.3s ease;
	}

	:global(.spiral-path-1) {
		stroke-width: 1.5;
		stroke-dasharray: 200 100;
		opacity: 0.4;
	}

	:global(.spiral-path-2) {
		stroke-width: 1;
		stroke-dasharray: 150 150;
		opacity: 0.25;
	}

	:global(.spiral-path-3) {
		stroke-width: 0.8;
		stroke-dasharray: 100 200;
		opacity: 0.2;
	}

	:global(.spiral-path-accent) {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 0.5;
	}

	.theme-minimalist :global(.avatar-decorations) {
		opacity: 0.85;
	}

	.theme-retro :global(.spiral-svg) {
		width: 550px;
		height: 550px;
	}

	/* Donut Chart */
	:global(.donut-chart-container) {
		width: 360px;
		height: 360px;
		position: relative;
	}

	:global(.donut-chart) {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	:global(.donut-segment) {
		transition: stroke-dasharray 0.3s ease;
	}

	:global(.progress-ring) {
		filter: drop-shadow(0 0 10px var(--color-accent-glow));
	}

	:global(.streak-ring) {
		filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.4));
	}

	.theme-minimalist :global(.donut-segment) {
		filter: none !important;
	}

	.theme-minimalist :global(.progress-ring) {
		stroke: #000 !important;
		filter: none;
	}

	.theme-minimalist :global(.streak-ring) {
		stroke: #666 !important;
		filter: none;
	}

	.theme-retro :global(.donut-segment) {
		filter: drop-shadow(0 0 12px var(--color-accent)) !important;
	}

	/* Compact Record Cards (Horizontal Layout) */
	:global(.record-card-compact) {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 20px 12px;
		background: transparent;
		border-radius: 16px;
		border: none;
	}

	:global(.record-icon-compact) {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-gold);
		margin-bottom: 12px;
		background: transparent;
		border: none;
		box-shadow: none;
	}

	.theme-minimalist :global(.record-card-compact),
	.theme-minimalist :global(.record-icon-compact) {
		background: transparent;
		border: none;
		box-shadow: none;
	}

	/* Theme-specific background/stroke overrides */
	.theme-neon :global(.donut-bg),
	.theme-retro :global(.donut-bg) {
		stroke: rgba(255, 255, 255, 0.05);
	}

	.theme-neon :global(.sport-bar-bg),
	.theme-retro :global(.sport-bar-bg) {
		background-color: rgba(255, 255, 255, 0.05) !important;
	}

	.theme-neon :global(.progress-ring-bg),
	.theme-retro :global(.progress-ring-bg) {
		stroke: rgba(255, 255, 255, 0.08);
	}

	.theme-neon :global(.consistency-card),
	.theme-retro :global(.consistency-card),
	.theme-minimalist :global(.consistency-card) {
		background-color: transparent !important;
		border: none !important;
		box-shadow: none !important;
	}

	/* Timeline Styles */
	:global(.timeline-line) {
		background: linear-gradient(
			to bottom,
			transparent 0%,
			var(--color-accent) 5%,
			var(--color-accent) 95%,
			transparent 100%
		);
		opacity: 0.3;
	}

	:global(.timeline-node) {
		background: var(--color-surface);
		border: 3px solid var(--color-accent);
		box-shadow: 0 0 12px var(--color-accent-glow);
	}

	:global(.timeline-card) {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.theme-minimalist :global(.timeline-line) {
		background: linear-gradient(to bottom, transparent 0%, #000 5%, #000 95%, transparent 100%);
		opacity: 0.15;
	}

	.theme-minimalist :global(.timeline-node) {
		background: #fff;
		border-color: #000;
		box-shadow: none;
	}

	.theme-minimalist :global(.timeline-node > div) {
		background: #000 !important;
	}

	.theme-minimalist :global(.timeline-card) {
		background: rgba(0, 0, 0, 0.02);
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	.theme-retro :global(.timeline-line) {
		background: linear-gradient(
			to bottom,
			transparent 0%,
			#ff00cc 5%,
			#ff00cc 95%,
			transparent 100%
		);
		opacity: 0.5;
	}

	.theme-retro :global(.timeline-node) {
		border-color: #ff00cc;
		box-shadow: 0 0 16px rgba(255, 0, 204, 0.6);
	}

	.theme-retro :global(.timeline-card) {
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 0, 204, 0.3);
	}
</style>
