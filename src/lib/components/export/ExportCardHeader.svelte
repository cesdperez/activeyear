<script lang="ts">
	import type { Theme } from '#lib/types/index.js';
	import type { Snippet } from 'svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { nameFontSize } from '#lib/utils/export.js';
	import Logotype from '#lib/components/Logotype.svelte';
	import LightmileWordmark from './LightmileWordmark.svelte';

	let {
		title,
		userName,
		aside,
		theme,
		yearSoFar
	}: { title: string; userName: string; aside?: Snippet; theme: Theme; yearSoFar: boolean } =
		$props();

	const season = $derived(
		(yearSoFar ? i18n.m.export.seasonSoFar : i18n.m.export.season)(TARGET_YEAR)
	);
	const owner = $derived(i18n.m.export.owner(userName));
	const longestWord = $derived(Math.max(...owner.split(/\s+/).map((word) => word.length)));
</script>

<header class="mb-[56px]">
	<div class="flex items-center justify-between gap-10">
		{#if theme === 'lightmile'}
			<div class="flex shrink-0 items-center gap-4 whitespace-nowrap">
				<Logotype class="text-[64px]" />
				<span class="text-[40px] font-normal text-[var(--color-text-muted)]">×</span>
				<LightmileWordmark class="h-[40px] w-auto text-[var(--color-text-primary)]" />
			</div>
		{:else}
			<Logotype class="text-[64px]" />
		{/if}
		<div class="@container min-w-0 flex-1">
			<p class="season card-label" style:--season-chars={season.length}>{season}</p>
		</div>
	</div>
	<div class="mt-12 flex items-end justify-between gap-10">
		<div class="@container min-w-0 flex-1">
			{#if userName}
				<p
					class="export-name mb-3 line-clamp-2 leading-[1.1] [overflow-wrap:anywhere] text-[var(--color-text-primary)]"
					style:--name-size="calc({nameFontSize(userName)}px * var(--name-scale))"
					style:--name-chars={owner.length}
					style:--name-word-chars={longestWord}
				>
					{owner}
				</p>
			{/if}
			<p class="export-title">{title}</p>
		</div>
		{@render aside?.()}
	</div>
</header>

<style>
	/* One row beside the wordmarks: a long translation shrinks instead of wrapping. */
	:global(.export-card) .season {
		color: var(--color-accent);
		white-space: nowrap;
		text-align: right;
		font-size: min(var(--label-size), 100cqi / (var(--season-chars) * var(--label-char-em)));
	}

	/* A long name shrinks so it fits in two lines and its longest word in one, so the clamp never
	   cuts the possessive. Wrapping at word ends wastes some of each line, hence 1.8 lines. */
	.export-name {
		font-size: min(
			var(--name-size),
			180cqi / (var(--name-chars) * var(--name-char-em)),
			100cqi / (var(--name-word-chars) * var(--name-char-em))
		);
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
