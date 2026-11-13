<script lang="ts">
	import type { Snippet } from 'svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { nameFontSize } from '#lib/utils/export.js';
	import Logotype from '#lib/components/Logotype.svelte';

	let { title, userName, aside }: { title: string; userName: string; aside?: Snippet } = $props();
</script>

<header class="mb-[56px]">
	<div class="flex items-center justify-between gap-10">
		<Logotype class="text-[64px]" />
		<p class="season card-label">{i18n.m.export.season(TARGET_YEAR)}</p>
	</div>
	<div class="mt-12 flex items-end justify-between gap-10">
		<div class="min-w-0 flex-1">
			{#if userName}
				<p
					class="export-name mb-3 line-clamp-2 leading-[1.1] [overflow-wrap:anywhere] text-[var(--color-text-primary)]"
					style="font-size: calc({nameFontSize(userName)}px * var(--name-scale));"
				>
					{i18n.m.export.owner(userName)}
				</p>
			{/if}
			<p class="export-title">{title}</p>
		</div>
		{@render aside?.()}
	</div>
</header>

<style>
	.season {
		color: var(--color-accent);
	}

	.export-name {
		font-family: var(--font-stat);
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	.export-title {
		font-family: var(--font-display);
		font-size: var(--title-size);
		font-weight: 900;
		line-height: 0.92;
		letter-spacing: -0.005em;
		color: var(--color-text-primary);
	}

	:global(.theme-retro) .export-title {
		line-height: 1.2;
		letter-spacing: 0;
		text-shadow: var(--hero-shadow);
	}

	:global(.theme-lightmile) .export-title {
		letter-spacing: -0.04em;
		text-transform: uppercase;
	}
</style>
