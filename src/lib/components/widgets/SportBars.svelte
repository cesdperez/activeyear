<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { sportIcons } from '#lib/constants/sports.js';
	import type { SportColors } from '#lib/utils/breakdown.js';
	import { formatCount, formatDuration } from '#lib/utils/format.js';
	import type {
		BreakdownMetric,
		SportBreakdown,
		WidgetVariant,
		WidgetVariantProps
	} from '#lib/types/index.js';

	let {
		sports,
		colors,
		metric,
		variant
	}: {
		sports: SportBreakdown[];
		colors: SportColors;
		metric: BreakdownMetric;
	} & WidgetVariantProps = $props();

	interface Styles {
		list: string;
		row: string;
		icon: string;
		name: string;
		value: string;
		bar: string;
		/** Entrance animation of the dashboard rows. */
		enter: (index: number) => string | undefined;
	}

	const STYLES: Record<WidgetVariant, Styles> = {
		dashboard: {
			list: 'w-full max-w-2xl flex-1 space-y-6',
			row: 'group flex flex-col gap-2',
			icon: 'h-5 w-5',
			name: 'text-xl',
			value: 'text-2xl',
			bar: 'h-2',
			enter: (i) => `animation: fadeInUp 0.4s ease-out both; animation-delay: ${600 + i * 50}ms`
		},
		export: {
			list: 'flex-1 space-y-6',
			row: 'flex flex-col gap-2',
			icon: 'h-7 w-7',
			name: 'text-[calc(30px*var(--stat-scale,1))]',
			value: 'text-[calc(32px*var(--stat-scale,1))]',
			bar: 'h-3',
			enter: () => undefined
		}
	};

	const style = $derived(STYLES[variant]);
	const maxValue = $derived(Math.max(...sports.map((s) => s[metric]), 1));
</script>

<div class={style.list}>
	{#each sports as sport, i (sport.type)}
		{@const IconComponent = sportIcons[sport.type]}
		{@const value = sport[metric]}
		{@const formattedValue =
			metric === 'count' ? formatCount(i18n.locale, value) : formatDuration(i18n.locale, value)}

		<div class={style.row} style={style.enter(i)}>
			<div class="flex items-end justify-between gap-4">
				<div class="flex min-w-0 items-center gap-3 text-[var(--color-text-primary)]">
					<IconComponent class="shrink-0 {style.icon}" weight="bold" aria-hidden="true" />
					<span class="stat-value truncate leading-none {style.name}">
						{i18n.m.common.sports[sport.type]}
					</span>
				</div>
				<span
					class="stat-value leading-none whitespace-nowrap text-[var(--color-text-primary)] {style.value}"
				>
					{formattedValue}
				</span>
			</div>

			<div class="sport-bar-bg w-full bg-[var(--color-surface-hover)] {style.bar}">
				<div
					class="bar-fill h-full transition-all duration-500"
					style="width: {(value / maxValue) * 100}%; background: {colors[sport.type]};"
				></div>
			</div>
		</div>
	{/each}
</div>

<style>
	/* Forced colors drop the inline sport colour, which would leave the bar invisible. */
	.bar-fill {
		forced-color-adjust: none;
	}

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
