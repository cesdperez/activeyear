<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';

	let { title }: { title: string } = $props();
</script>

<header class="relative mb-[130px] text-center">
	{#if appStore.userName}
		<p
			class="relative z-10 mr-[-0.1em] mb-2 text-[42px] leading-none font-bold tracking-widest text-[var(--color-accent)] uppercase"
		>
			{appStore.userName}'s
		</p>
	{/if}
	<div class="flex flex-col items-center justify-center">
		<h2
			class="mr-[0.05em] mb-2 text-[140px] leading-[0.8] font-black tracking-tighter text-[var(--color-text-primary)]"
		>
			{appStore.selectedYear}
		</h2>
		<h1
			class="export-title relative z-10 mr-[-0.15em] text-[72px] leading-none font-bold tracking-[0.15em] text-[var(--color-text-dim)] uppercase"
		>
			{title}
		</h1>
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
