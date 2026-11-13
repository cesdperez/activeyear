<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { sportIcons } from '#lib/constants/sports.js';
	import type { SportColors } from '#lib/utils/breakdown.js';
	import { formatCount, formatDuration } from '#lib/utils/format.js';
	import type { BreakdownMetric, SportBreakdown, WidgetVariant } from '#lib/types/index.js';

	let {
		sports,
		colors,
		metric,
		variant
	}: {
		sports: SportBreakdown[];
		colors: SportColors;
		metric: BreakdownMetric;
		variant: WidgetVariant;
	} = $props();

	const isDashboard = $derived(variant === 'dashboard');
	const maxValue = $derived(Math.max(...sports.map((s) => s[metric]), 1));
</script>

<div class={isDashboard ? 'w-full max-w-2xl flex-1 space-y-6' : 'flex-1 space-y-6'}>
	{#each sports as sport, i (sport.type)}
		{@const IconComponent = sportIcons[sport.type]}
		{@const value = sport[metric]}
		{@const formattedValue =
			metric === 'count' ? formatCount(i18n.locale, value) : formatDuration(i18n.locale, value)}
		{@const percentage = (value / maxValue) * 100}
		{@const color = colors[sport.type]}

		<div
			class={isDashboard ? 'group flex flex-col gap-2' : 'flex flex-col gap-2'}
			style={isDashboard
				? `animation: fadeInUp 0.4s ease-out both; animation-delay: ${600 + i * 50}ms`
				: undefined}
		>
			<div class="flex items-center justify-between gap-3">
				<div class="flex min-w-0 items-center gap-3">
					<div
						class={isDashboard
							? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110'
							: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'}
						style="background: {color}20; color: {color};"
					>
						<IconComponent class="h-5 w-5" weight="bold" aria-hidden="true" />
					</div>
					<span
						class={isDashboard
							? 'font-bold tracking-wide text-white uppercase'
							: 'text-[24px] font-bold tracking-wide text-[var(--color-text-primary)] uppercase'}
					>
						{i18n.m.common.sports[sport.type]}
					</span>
				</div>
				<div class="text-right">
					{#if isDashboard}
						<span class="font-mono font-bold text-[var(--color-accent)]">
							{formattedValue}
						</span>
					{:else}
						<div
							class="text-[22px] leading-none font-bold whitespace-nowrap text-[var(--color-text-primary)]"
						>
							{formattedValue}
						</div>
					{/if}
				</div>
			</div>

			{#if isDashboard}
				<div class="h-2 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
					<div
						class="h-full rounded-full transition-all duration-1000 ease-out"
						style="width: {percentage}%; background: {color}; box-shadow: 0 0 10px {color}40;"
					></div>
				</div>
			{:else}
				<div class="sport-bar-bg h-3 overflow-hidden rounded-full bg-[rgba(0,0,0,0.05)]">
					<div
						class="h-full rounded-full transition-all duration-500"
						style="width: {percentage}%; background: {color}; filter: drop-shadow(0 0 4px {color}40);"
					></div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	/* Global because Svelte renames scoped keyframes, and the inline animation refers to this name. */
	@keyframes -global-fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
