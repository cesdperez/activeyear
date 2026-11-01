<script lang="ts">
	import { TARGET_YEAR } from '#lib/constants/time.js';

	import { nameFontSize } from '#lib/utils/export.js';

	let { title, userName }: { title: string; userName: string } = $props();
</script>

<header class="relative mb-[130px] text-center">
	{#if userName}
		<p
			class="export-name relative z-10 mr-[-0.1em] mb-2 line-clamp-2 leading-[1.1] font-bold tracking-widest [overflow-wrap:anywhere] text-[var(--color-accent)] uppercase"
			style="font-size: {nameFontSize(userName)}px;"
		>
			{userName}'s
		</p>
	{/if}
	<div class="flex flex-col items-center justify-center">
		<p
			class="mr-[0.05em] mb-2 text-[140px] leading-[0.8] font-black tracking-tighter text-[var(--color-text-primary)]"
		>
			{TARGET_YEAR}
		</p>
		<p
			class="export-title relative z-10 mr-[-0.15em] text-[72px] leading-none font-bold tracking-[0.15em] text-[var(--color-text-dim)] uppercase"
		>
			{title}
		</p>
	</div>
</header>

<style>
	:global(.theme-neon) .export-title {
		text-shadow: 0 0 40px var(--color-accent-glow);
		color: var(--color-text-primary);
	}

	:global(.theme-minimalist) .export-title {
		color: #000;
		letter-spacing: -0.05em;
	}

	:global(.theme-retro) .export-title {
		text-shadow: 3px 3px 0px var(--color-accent-dim);
		font-style: italic;
	}
</style>
