<script lang="ts">
	import type { Activity, Unit, Theme } from '#lib/types/index.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { tick } from 'svelte';
	import { activityTitle, formatCount, formatDistance, formatDuration } from '#lib/utils/format.js';
	import { monthLabels } from '#lib/utils/date.js';
	import { timelineGap } from '#lib/utils/export.js';
	import { HIGHLIGHTS_LIMIT, TIMELINE_GAP } from '#lib/constants/export.js';
	import { Target } from 'phosphor-svelte';
	import { sportIcons } from '#lib/constants/sports.js';
	import ExportCardBase from './ExportCardBase.svelte';

	let {
		highlights: allHighlights,
		unit,
		theme,
		displayName,
		yearSoFar
	}: {
		highlights: Activity[];
		unit: Unit;
		theme: Theme;
		displayName: string;
		yearSoFar: boolean;
	} = $props();

	const monthNames = $derived(monthLabels(i18n.locale));

	const SIZES = {
		full: {
			card: 'gap-8 p-8',
			icon: 'h-16 w-16',
			glyph: 'h-8 w-8',
			title: 'calc(40px * var(--stat-scale))',
			day: 'calc(56px * var(--stat-scale))',
			meta: 'calc(28px * var(--stat-scale))'
		},
		compact: {
			card: 'gap-4 p-4',
			icon: 'h-12 w-12',
			glyph: 'h-6 w-6',
			title: 'calc(28px * var(--stat-scale))',
			day: 'calc(40px * var(--stat-scale))',
			meta: 'calc(20px * var(--stat-scale))'
		},
		dense: {
			card: 'gap-3 p-2',
			icon: 'h-10 w-10',
			glyph: 'h-5 w-5',
			title: 'calc(22px * var(--stat-scale))',
			day: 'calc(32px * var(--stat-scale))',
			meta: 'calc(16px * var(--stat-scale))'
		}
	};

	let limit = $state(HIGHLIGHTS_LIMIT);
	let gap = $state(TIMELINE_GAP.min);
	let lineInset = $state({ top: 45, bottom: 45 });
	let area = $state<HTMLElement>();
	let list = $state<HTMLElement>();

	let highlights = $derived(allHighlights.slice(0, limit));
	let hiddenCount = $derived(allHighlights.length - highlights.length);
	let compact = $state(false);
	let dense = $state(false);
	let size = $derived(dense ? SIZES.dense : compact ? SIZES.compact : SIZES.full);
	let fitRun = 0;

	// How titles wrap depends on the rendered font, so only the DOM knows how many items fit.
	async function fitToCard() {
		const run = ++fitRun;
		const isStale = () => run !== fitRun;
		await fitItems(isStale);
		if (!isStale()) spreadItems();
	}

	async function fitItems(isStale: () => boolean) {
		compact = false;
		dense = false;
		limit = HIGHLIGHTS_LIMIT;
		gap = TIMELINE_GAP.min;
		await tick();
		if (isStale()) return;
		compact = overflows();
		await tick();
		if (isStale()) return;
		dense = overflows();
		await tick();
		while (!isStale() && limit > 1 && overflows()) {
			limit -= 1;
			await tick();
		}
	}

	function overflows(): boolean {
		return !!area && !!list && list.scrollHeight > area.clientHeight;
	}

	function spreadItems() {
		if (!area || !list) return;
		const items = [...list.querySelectorAll<HTMLElement>(':scope > .timeline-item')];
		const itemsHeight = items.reduce((sum, el) => sum + el.offsetHeight, 0);
		gap = timelineGap(area.clientHeight, itemsHeight, items.length);
		lineInset = {
			top: (items[0]?.offsetHeight ?? 0) / 2,
			bottom: (items.at(-1)?.offsetHeight ?? 0) / 2
		};
	}

	$effect(() => {
		void [allHighlights, displayName, theme, unit, i18n.locale, area, list];
		fitToCard();
		document.fonts.ready.then(fitToCard);
	});
</script>

<ExportCardBase
	{theme}
	{displayName}
	{yearSoFar}
	variant="highlights"
	title={i18n.m.export.highlights}
>
	<div class="flex min-h-0 flex-1 flex-col">
		{#if highlights.length === 0}
			<div class="flex flex-1 items-center">
				<div class="card-text-md text-[var(--color-text-muted)]">
					{i18n.m.export.noHighlights}
				</div>
			</div>
		{:else}
			<div bind:this={area} class="fit-area relative flex min-h-0 flex-1 flex-col justify-center">
				<div bind:this={list} class="relative flex w-full flex-col" style="gap: {gap}px;">
					<div
						class="timeline-line absolute left-[133px] w-[2px]"
						style="top: {lineInset.top}px; bottom: {lineInset.bottom}px;"
					></div>
					{#each highlights as fav, i (i)}
						{@const IconComponent = sportIcons[fav.type] ?? Target}
						{@const date = new Date(fav.date)}

						<div class="timeline-item relative flex shrink-0 items-center gap-6">
							<div class="w-[96px] shrink-0">
								<div class="card-label text-[var(--color-accent)]">
									{monthNames[date.getMonth()]}
								</div>
								<div
									class="stat-value leading-none text-[var(--color-text-primary)]"
									style:font-size={size.day}
								>
									{date.getDate()}
								</div>
							</div>

							<div
								class="timeline-node relative z-10 flex h-[28px] w-[28px] shrink-0 items-center justify-center"
							>
								<div class="h-[10px] w-[10px] bg-[var(--color-accent)]"></div>
							</div>

							<div class="timeline-card panel flex min-w-0 flex-1 items-center {size.card}">
								<div
									class="{size.icon} flex shrink-0 items-center justify-center text-[var(--color-text-muted)]"
								>
									<IconComponent class={size.glyph} weight="bold" aria-hidden="true" />
								</div>
								<div class="min-w-0 flex-1">
									<div class="mb-1 flex items-center gap-2">
										<div
											class="highlight-title {dense
												? 'line-clamp-1'
												: 'line-clamp-2'} min-w-0 flex-1 leading-[1.1] font-bold [overflow-wrap:anywhere] text-[var(--color-text-primary)]"
											style:font-family="var(--font-stat)"
											style:font-size={size.title}
										>
											{activityTitle(i18n.locale, fav)}
										</div>
									</div>
									<div
										class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--color-text-muted)]"
										style:font-size={size.meta}
									>
										{#if fav.distance > 0}
											<span class="stat-value"
												>{formatDistance(i18n.locale, fav.distance, unit)}</span
											>
										{/if}
										<span class="stat-value">{formatDuration(i18n.locale, fav.duration)}</span>
										<span class="sport-name">{i18n.m.common.sports[fav.type] ?? fav.type}</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			{#if hiddenCount > 0}
				<div class="card-text-sm mt-6 text-[var(--color-text-muted)]">
					{i18n.m.export.moreHighlights(formatCount(i18n.locale, hiddenCount), hiddenCount)}
				</div>
			{/if}
		{/if}
	</div>
</ExportCardBase>

<style>
	/* Reduced motion gives every change a 0.01ms transition, which fitToCard would measure before it ends. */
	.fit-area,
	.fit-area :global(*) {
		transition: none !important;
	}

	.sport-name {
		color: var(--color-accent);
	}
</style>
