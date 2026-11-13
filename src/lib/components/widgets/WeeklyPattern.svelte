<script lang="ts">
	import { weekdayLabels } from '#lib/utils/date.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
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

	const TOP_DAY_FILL = { solid: '#00ff88', faded: '#00ff8840', glow: '#00ff8830' };
	// A hex alpha suffix is invalid after var(), so fading the accent needs color-mix.
	const ACCENT_FILL = {
		solid: 'var(--color-accent)',
		faded: 'color-mix(in srgb, var(--color-accent) 25%, transparent)',
		glow: 'var(--color-accent-glow)'
	};

	// The neon green reads on the dark themes but almost vanishes on Minimal's white card.
	const exportTopDayFill = $derived(
		theme === 'minimalist' ? 'var(--color-text-primary)' : TOP_DAY_FILL.solid
	);

	const barContainerHeight = $derived(variant === 'dashboard' ? 160 : 100);

	const hasActivity = $derived(pattern.some((v) => v > 0));
	const bars = $derived(weeklyBars(pattern, barContainerHeight));
	const weekdays = $derived(weekdayLabels(i18n.locale));
</script>

{#if hasActivity}
	{#if variant === 'dashboard'}
		<section class="mb-16">
			<SectionHeading title={i18n.m.dashboard.whenYouTrain} />

			<div
				data-testid="weekly-pattern-row"
				class="flex items-end justify-between gap-1 sm:gap-4 sm:px-4"
				style="height: {barContainerHeight + 60}px;"
			>
				{#each bars as { barHeight, isTopDay }, i (i)}
					{@const fill = isTopDay ? TOP_DAY_FILL : ACCENT_FILL}
					<div class="flex flex-1 flex-col items-center justify-end gap-3">
						<span class="font-mono text-sm text-[var(--color-text-muted)]">
							{pattern[i]}
						</span>
						<div
							data-testid="weekly-pattern-bar"
							class="w-full rounded-t-xl transition-all duration-500 ease-out"
							style="height: {barHeight}px; background: linear-gradient(to top, {fill.solid}, {fill.faded}); box-shadow: 0 0 20px {fill.glow};"
							style:animation-delay="{i * 50}ms"
						></div>
						<span
							class="text-xs font-bold tracking-wide text-[var(--color-text-muted)] uppercase sm:text-sm sm:tracking-wider"
						>
							{weekdays[i]}
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
				{i18n.m.dashboard.whenYouTrain}
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
								? exportTopDayFill
								: 'var(--color-accent)'}; opacity: {theme === 'minimalist'
								? 0.8
								: 0.4 + (heightPercent / 100) * 0.6};"
						></div>
						<span class="text-[16px] font-bold text-[var(--color-text-muted)]">
							{weekdays[i][0]}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/if}
