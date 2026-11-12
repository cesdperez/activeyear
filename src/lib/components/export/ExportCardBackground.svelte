<script lang="ts">
	import type { Theme } from '#lib/types/index.js';
	import neonGradient from '#lib/assets/neon-gradient.png?inline';
	import neonNoise from '#lib/assets/neon-noise.png?inline';

	let { theme }: { theme: Theme } = $props();
</script>

<div class="export-background absolute inset-0"></div>

<!-- Images, not a CSS gradient and feTurbulence: both dither per pixel, which pushes the exported PNG past 2 MB. -->
{#if theme === 'neon'}
	<div
		class="absolute inset-0"
		style="background: url({neonGradient}) 0 0 / 100% 100% no-repeat;"
	></div>
	<div class="absolute inset-0 opacity-[0.03]" style="background-image: url({neonNoise});"></div>
{/if}

<style>
	.export-background {
		background: var(--color-surface);
	}

	:global(.theme-minimalist) .export-background {
		background: #fdfdfd;
	}

	:global(.theme-retro) .export-background {
		background: linear-gradient(135deg, #2e2660 0%, #1e1b4b 100%);
	}
</style>
