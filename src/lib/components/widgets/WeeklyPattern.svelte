<script lang="ts">
	import { WEEKDAY_LABELS } from '#lib/constants/time.js';
	import { weeklyBars } from '#lib/utils/breakdown.js';
	import type {
		Theme,
		WeeklyPattern as WeeklyPatternData,
		WidgetVariant
	} from '#lib/types/index.js';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';

	let {
		pattern,
		variant,
		theme
	}: { pattern: WeeklyPatternData; variant: WidgetVariant; theme?: Theme } = $props();

	const exportDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
	const barContainerHeight = $derived(variant === 'dashboard' ? 160 : 100);

	const hasActivity = $derived(pattern.some((v) => v > 0));
	const bars = $derived(weeklyBars(pattern, barContainerHeight));
</script>

{#if hasActivity}
	{#if variant === 'dashboard'}
		<section class="mb-16">
			<SectionHeading title="When You Train" />

			<div
				class="flex items-end justify-between gap-4 px-4"
				style="height: {barContainerHeight + 60}px;"
			>
				{#each bars as { barHeight, isTopDay }, i (i)}
					<div class="flex flex-1 flex-col items-center justify-end gap-3">
						<span class="font-mono text-sm text-[var(--color-text-muted)]">
							{pattern[i]}
						</span>
						<div
							class="w-full rounded-t-xl transition-all duration-500 ease-out"
							style="height: {barHeight}px; background: linear-gradient(to top, {isTopDay
								? '#00ff88'
								: 'var(--color-accent)'}, {isTopDay
								? '#00ff8840'
								: 'var(--color-accent)40'}); box-shadow: 0 0 20px {isTopDay
								? '#00ff8830'
								: 'var(--color-accent-glow)'};"
							style:animation-delay="{i * 50}ms"
						></div>
						<span class="text-sm font-bold tracking-wider text-[var(--color-text-muted)] uppercase">
							{WEEKDAY_LABELS[i]}
						</span>
					</div>
				{/each}
			</div>
		</section>
	{:else}
		<div class="mb-16 px-2">
			<div
				class="mb-4 text-center text-[18px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase"
			>
				When You Train
			</div>
			<div
				class="flex items-end justify-between gap-3"
				style="height: {barContainerHeight + 28}px;"
			>
				{#each bars as { heightPercent, barHeight, isTopDay }, i (i)}
					<div class="flex flex-1 flex-col items-center justify-end gap-2">
						<div
							class="weekly-bar w-full rounded-t-lg transition-all"
							style="height: {barHeight}px; background: {isTopDay
								? '#00ff88'
								: 'var(--color-accent)'}; opacity: {theme === 'minimalist'
								? 0.8
								: 0.4 + (heightPercent / 100) * 0.6};"
						></div>
						<span class="text-[16px] font-bold text-[var(--color-text-muted)]">
							{exportDayLabels[i]}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/if}
