<script lang="ts">
	import { weekdayLabels } from '#lib/utils/date.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { weeklyBars } from '#lib/utils/breakdown.js';
	import type {
		WeeklyPattern as WeeklyPatternData,
		WidgetVariant,
		WidgetVariantProps
	} from '#lib/types/index.js';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';

	let { pattern, variant }: { pattern: WeeklyPatternData } & WidgetVariantProps = $props();

	interface Styles {
		/** Tallest bar, in px. */
		barHeight: number;
		/** Room around the bars for the count above and the weekday below. */
		gutter: number;
		section: string;
		row: string;
		column: string;
		bar: string;
		count: string;
		day: string;
	}

	const TOP_FILL = 'var(--color-accent)';
	const DIM_FILL = 'var(--color-text-dim)';

	const barFill = (isTopDay: boolean) => (isTopDay ? TOP_FILL : DIM_FILL);

	const STYLES: Record<WidgetVariant, Styles> = {
		dashboard: {
			barHeight: 160,
			gutter: 60,
			section: 'mb-20 md:mb-28',
			row: 'gap-1 sm:gap-4 sm:px-4',
			column: 'gap-3',
			bar: 'max-w-14 duration-500 ease-out',
			count: 'text-xl',
			day: 'text-sm'
		},
		export: {
			barHeight: 90,
			gutter: 72,
			section: 'mb-[36px]',
			row: 'gap-3',
			column: 'gap-2',
			bar: 'max-w-[72px]',
			count: 'text-[calc(28px*var(--stat-scale,1))]',
			day: 'card-label'
		}
	};

	const style = $derived(STYLES[variant]);
	const hasActivity = $derived(pattern.some((v) => v > 0));
	const bars = $derived(weeklyBars(pattern, style.barHeight));
	const weekdays = $derived(weekdayLabels(i18n.locale));
</script>

{#if hasActivity}
	<section class={style.section}>
		<SectionHeading title={i18n.m.dashboard.whenYouTrain} {variant} />
		<div
			data-testid="weekly-pattern-row"
			class="flex items-end justify-between {style.row}"
			style="height: {style.barHeight + style.gutter}px;"
		>
			{#each bars as { barHeight, isTopDay }, i (i)}
				<div class="flex flex-1 flex-col items-center justify-end {style.column}">
					<span
						class="stat-value leading-none {style.count} {isTopDay
							? 'text-[var(--color-accent)]'
							: 'text-[var(--color-text-muted)]'}">{pattern[i]}</span
					>
					<div
						data-testid="weekly-pattern-bar"
						class="weekly-bar w-full transition-all {style.bar}"
						style="height: {barHeight}px; background: {barFill(isTopDay)}; animation-delay: {i *
							50}ms"
					></div>
					<span class="text-[var(--color-text-muted)] {style.day}">{weekdays[i]}</span>
				</div>
			{/each}
		</div>
	</section>
{/if}
