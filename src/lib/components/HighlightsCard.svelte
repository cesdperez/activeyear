<script lang="ts">
	import { tick } from 'svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { formatCount, formatDistance, formatDuration, pluralize } from '#lib/utils/format.js';
	import { timelineGap } from '#lib/utils/export.js';
	import { HIGHLIGHTS_LIMIT, TIMELINE_GAP } from '#lib/constants/export.js';
	import { Star, Target } from 'phosphor-svelte';
	import { sportNames, sportIcons } from '#lib/constants/sports.js';
	import type { Activity } from '#lib/types/index.js';
	import ExportCardBase from './ExportCardBase.svelte';

	const monthNames = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC'
	];

	let limit = $state(HIGHLIGHTS_LIMIT);
	let gap = $state(TIMELINE_GAP.min);
	let lineInset = $state({ top: 45, bottom: 45 });
	let area = $state<HTMLElement>();
	let list = $state<HTMLElement>();

	let highlights = $derived(appStore.highlights.slice(0, limit));
	let hiddenCount = $derived(appStore.highlights.length - highlights.length);
	let compact = $state(false);
	let fitRun = 0;

	function titleOf(fav: Activity): string {
		return fav.title || sportNames[fav.type] || 'Activity';
	}

	// How titles wrap depends on the rendered font, so only the DOM knows how many items fit.
	async function fitToCard() {
		const run = ++fitRun;
		const isStale = () => run !== fitRun;
		await fitItems(isStale);
		if (!isStale()) spreadItems();
	}

	async function fitItems(isStale: () => boolean) {
		compact = false;
		limit = HIGHLIGHTS_LIMIT;
		gap = TIMELINE_GAP.min;
		await tick();
		if (isStale()) return;
		compact = overflows();
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
		void [appStore.highlights, appStore.displayName, appStore.theme, appStore.unit, area, list];
		fitToCard();
		document.fonts.ready.then(fitToCard);
	});
</script>

<ExportCardBase variant="highlights" title="HIGHLIGHTS">
	<div class="-mt-[52px] flex min-h-0 flex-1 flex-col px-6">
		{#if highlights.length === 0}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center text-[28px] text-[var(--color-text-muted)]">
					No highlight activities yet
				</div>
			</div>
		{:else}
			<div bind:this={area} class="fit-area relative flex min-h-0 flex-1 flex-col justify-center">
				<div bind:this={list} class="relative flex w-full flex-col" style="gap: {gap}px;">
					<div
						class="timeline-line absolute left-[60px] w-[4px]"
						style="top: {lineInset.top}px; bottom: {lineInset.bottom}px;"
					></div>
					{#each highlights as fav, i (i)}
						{@const IconComponent = sportIcons[fav.type] ?? Target}
						{@const date = new Date(fav.date)}
						{@const month = monthNames[date.getMonth()]}
						{@const day = date.getDate()}

						<div class="timeline-item relative flex shrink-0 items-center gap-6">
							<!-- Date Column -->
							<div class="w-[48px] shrink-0 text-center">
								<div class="text-[14px] font-bold tracking-widest text-[var(--color-accent)]">
									{month}
								</div>
								<div class="text-[32px] leading-none font-black text-[var(--color-text-primary)]">
									{day}
								</div>
							</div>

							<!-- Timeline Node -->
							<div
								class="timeline-node relative z-10 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full"
							>
								<div class="h-[14px] w-[14px] rounded-full bg-[var(--color-accent)]"></div>
							</div>

							<!-- Activity Card -->
							<div
								class="flex min-w-0 flex-1 items-center {compact
									? 'gap-4 p-4'
									: 'gap-8 p-8'} timeline-card rounded-2xl"
							>
								<div
									class="{compact
										? 'h-12 w-12 rounded-xl'
										: 'h-16 w-16 rounded-2xl'} flex shrink-0 items-center justify-center bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
								>
									<IconComponent
										class={compact ? 'h-6 w-6' : 'h-8 w-8'}
										weight="bold"
										aria-hidden="true"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<div class="mb-1 flex items-center gap-2">
										<Star
											class="{compact
												? 'h-4 w-4'
												: 'h-6 w-6'} highlight-star shrink-0 text-yellow-500"
											weight="fill"
											aria-hidden="true"
										/>
										<div
											class="{compact
												? 'text-[22px]'
												: 'text-[32px]'} highlight-title line-clamp-2 min-w-0 flex-1 font-bold [overflow-wrap:anywhere] text-[var(--color-text-primary)]"
										>
											{titleOf(fav)}
										</div>
									</div>
									<div
										class="flex flex-wrap items-center gap-x-3 gap-y-1 {compact
											? 'text-[16px]'
											: 'text-[22px]'} text-[var(--color-text-muted)]"
									>
										{#if fav.distance > 0}
											<span class="font-mono">
												{formatDistance(fav.distance, appStore.unit)}
											</span>
										{/if}
										<span class="font-mono">
											{formatDuration(fav.duration)}
										</span>
										<span
											class="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[12px] tracking-wider text-[var(--color-accent)] uppercase"
										>
											{sportNames[fav.type] ?? fav.type}
										</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			{#if hiddenCount > 0}
				<div class="mt-6 text-center text-[20px] text-[var(--color-text-muted)]">
					+{formatCount(hiddenCount)} more {pluralize(hiddenCount, 'highlight', 'highlights')}
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
</style>
