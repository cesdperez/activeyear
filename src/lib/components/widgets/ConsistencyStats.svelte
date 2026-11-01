<script lang="ts">
	import type { Component } from 'svelte';
	import { CalendarCheck, Lightning, type IconComponentProps } from 'phosphor-svelte';
	import { activeDaysPercent } from '#lib/utils/breakdown.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import type { WidgetVariant } from '#lib/types/index.js';

	interface DashboardStat {
		Icon: Component<IconComponentProps>;
		value: number;
		label: string;
		delay: number;
	}

	interface ExportStat {
		Icon: Component<IconComponentProps>;
		value: number;
		ringStroke: string;
		ringDashArray: string;
		ringClass: string;
		/** Tailwind text colour for the icon and label row. */
		colorClass: string;
		label: string;
		caption: string;
	}

	let {
		activeDays,
		longestStreak,
		variant
	}: { activeDays: number; longestStreak: number; variant: WidgetVariant } = $props();

	const yearPercent = $derived(activeDaysPercent(activeDays, TARGET_YEAR));
</script>

{#snippet dashboardStat({ Icon, value, label, delay }: DashboardStat)}
	<div
		class="stat-card group flex items-center gap-4 p-4 md:p-6"
		style="animation-delay: {delay}ms"
	>
		<div class="shrink-0 text-[var(--color-accent)]">
			<Icon class="h-6 w-6 md:h-8 md:w-8" weight="bold" aria-hidden="true" />
		</div>
		<div class="min-w-0">
			<div class="text-2xl leading-none font-bold text-white md:text-3xl">
				{value}
			</div>
			<div
				class="text-xs font-medium tracking-wider text-balance text-[var(--color-text-muted)] uppercase md:text-sm"
			>
				{label}
			</div>
		</div>
	</div>
{/snippet}

{#snippet exportStat({
	Icon,
	value,
	ringStroke,
	ringDashArray,
	ringClass,
	colorClass,
	label,
	caption
}: ExportStat)}
	<div class="consistency-card flex flex-col items-center rounded-2xl p-8 text-center">
		<div class="mb-4 h-44 w-44">
			<svg viewBox="0 0 120 120" class="h-full w-full">
				<circle
					cx="60"
					cy="60"
					r="52"
					fill="none"
					stroke="rgba(0,0,0,0.05)"
					class="progress-ring-bg"
					stroke-width="10"
				/>
				<circle
					cx="60"
					cy="60"
					r="52"
					fill="none"
					stroke={ringStroke}
					stroke-width="10"
					stroke-dasharray={ringDashArray}
					stroke-linecap="round"
					transform="rotate(-90 60 60)"
					class={ringClass}
				/>
				<text
					x="60"
					y="60"
					text-anchor="middle"
					dominant-baseline="central"
					fill="var(--color-text-primary)"
					style="font-size: 38px; font-weight: 900; font-family: inherit;">{value}</text
				>
			</svg>
		</div>
		<div class="flex items-center gap-3 {colorClass}">
			<Icon class="h-8 w-8" weight="bold" aria-hidden="true" />
			<span class="text-[28px] font-bold tracking-wider uppercase">{label}</span>
		</div>
		<div class="mt-2 text-[20px] whitespace-nowrap text-[var(--color-text-muted)]">
			{caption}
		</div>
	</div>
{/snippet}

{#if variant === 'dashboard'}
	<div
		data-testid="consistency-stats"
		class="mx-auto mb-16 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6"
	>
		{@render dashboardStat({
			Icon: CalendarCheck,
			value: activeDays,
			label: 'Active Days',
			delay: 350
		})}
		{@render dashboardStat({
			Icon: Lightning,
			value: longestStreak,
			label: 'most consecutive active days',
			delay: 400
		})}
	</div>
{:else}
	<div class="mb-16 grid grid-cols-2 gap-8">
		{@render exportStat({
			Icon: CalendarCheck,
			value: activeDays,
			ringStroke: 'var(--color-accent)',
			ringDashArray: `${yearPercent * 3.27} 327`,
			ringClass: 'progress-ring',
			colorClass: 'text-[var(--color-accent)]',
			label: 'Active Days',
			caption: `${Math.round(yearPercent)}% of the year`
		})}
		{@render exportStat({
			Icon: Lightning,
			value: longestStreak,
			ringStroke: '#ff6b6b',
			ringDashArray: '20 10',
			ringClass: 'streak-ring',
			colorClass: 'streak-label text-[#ff6b6b]',
			label: 'Day Streak',
			caption: 'most consecutive active days'
		})}
	</div>
{/if}
