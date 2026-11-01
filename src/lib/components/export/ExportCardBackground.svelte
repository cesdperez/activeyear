<script lang="ts">
	import type { Theme } from '#lib/types/index.js';

	let { theme }: { theme: Theme } = $props();
</script>

<div class="export-background absolute inset-0"></div>

{#if theme === 'neon'}
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E');"
	></div>
{/if}

<style>
	.export-background {
		background: var(--color-surface);
	}

	:global(.theme-neon) .export-background {
		background: radial-gradient(circle at 50% 0%, #1a1b26 0%, #050505 100%);
	}

	:global(.theme-minimalist) .export-background {
		background: #fdfdfd;
	}

	:global(.theme-retro) .export-background {
		background: linear-gradient(135deg, #2e2660 0%, #1e1b4b 100%);
	}
</style>
