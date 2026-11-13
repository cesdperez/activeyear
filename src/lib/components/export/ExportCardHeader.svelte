<script lang="ts">
	import type { Snippet } from 'svelte';
	import { yearData } from '#lib/stores/yearData.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { nameFontSize } from '#lib/utils/export.js';
	import Logotype from '#lib/components/Logotype.svelte';
	import LightmileWordmark from './LightmileWordmark.svelte';

	let { title, userName, aside }: { title: string; userName: string; aside?: Snippet } = $props();
</script>

<header class="mb-[56px]">
	<div class="flex items-center justify-between gap-10">
		{#if exportSettings.theme === 'lightmile'}
			<div class="flex shrink-0 items-center gap-4 whitespace-nowrap">
				<Logotype class="text-[64px]" />
				<span class="text-[40px] font-normal text-[var(--color-text-muted)]">×</span>
				<LightmileWordmark class="h-[40px] w-auto text-[var(--color-text-primary)]" />
			</div>
		{:else}
			<Logotype class="text-[64px]" />
		{/if}
		<p class:lightmile-season={exportSettings.theme === 'lightmile'} class="season card-label">
			{(yearData.yearSoFar ? i18n.m.export.seasonSoFar : i18n.m.export.season)(TARGET_YEAR)}
		</p>
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

	.lightmile-season {
		min-width: 0;
		text-align: right;
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
