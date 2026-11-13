<script lang="ts">
	import type { Theme } from '#lib/types/index.js';
	import neonGradient from '#lib/assets/neon-gradient.png?inline';
	import classicGradient from '#lib/assets/classic-gradient.png?inline';
	import neonNoise from '#lib/assets/neon-noise.png?inline';

	let { theme }: { theme: Theme } = $props();
</script>

<!-- Images, not a CSS gradient and feTurbulence: both dither per pixel, which pushes the exported PNG past 2 MB. -->
{#if theme === 'neon' || theme === 'classic'}
	<div
		class="absolute inset-0"
		style="background: url({theme === 'classic'
			? classicGradient
			: neonGradient}) 0 0 / 100% 100% no-repeat;"
	></div>
	<div class="absolute inset-0 opacity-[0.03]" style="background-image: url({neonNoise});"></div>
{:else if theme === 'lightmile'}
	<svg
		class="absolute top-0 right-0"
		width="160"
		height="110"
		viewBox="0 0 160 110"
		fill="none"
		aria-hidden="true"
	>
		<path
			d="M 160 15 H 120 L 95 40 H 65 L 35 70 H 0"
			stroke="#2438d6"
			stroke-width="1"
			stroke-dasharray="5 5"
			opacity="0.4"
		/>
	</svg>
{/if}
