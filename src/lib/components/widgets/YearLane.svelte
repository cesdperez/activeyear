<script lang="ts">
	import type { Activity, WidgetVariant, WidgetVariantProps } from '#lib/types/index.js';
	import {
		laneMarkers,
		laneMonthLabels,
		laneTicks,
		markerLeft,
		mergeCloseMarkers,
		monthLabelFit,
		monthStartDays
	} from '#lib/utils/yearLane.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { formatCount } from '#lib/utils/format.js';

	type Props = {
		activities: Activity[];
		highlights: Activity[];
		records: Activity[];
		year: number;
		elapsedDays?: number;
		yearSoFar?: boolean;
	} & WidgetVariantProps;

	let {
		activities,
		highlights,
		records,
		year,
		variant,
		elapsedDays,
		yearSoFar = false
	}: Props = $props();

	// In viewBox units: one day is 1 wide, the lane 100 tall.
	const TICK_WIDTH = 0.62;
	const REST_HEIGHT = 7;

	const STYLES: Record<
		WidgetVariant,
		{ lane: string; markers: string; month: string; legend: string; headPx: number }
	> = {
		dashboard: {
			lane: 'h-16 md:h-24',
			markers: 'h-5',
			month: 'text-[0.6875rem] md:text-xs',
			legend: 'text-xs',
			// The widest head, the record diamond, plus a sliver of air.
			headPx: 12
		},
		export: {
			lane: 'h-[190px]',
			markers: 'h-[34px]',
			month: 'card-label',
			legend: 'card-text-sm',
			headPx: 28
		}
	};

	const style = $derived(STYLES[variant]);
	const ticks = $derived(laneTicks(activities, year));
	const days = $derived(ticks.length);
	const counted = $derived(elapsedDays ?? days);
	const markers = $derived(
		laneMarkers(highlights, records, year).filter((marker) => marker.day < counted)
	);
	let laneWidth = $state(0);
	const heads = $derived(
		mergeCloseMarkers(markers, days, laneWidth ? (style.headPx * days) / laneWidth : 0)
	);
	const activeDays = $derived(ticks.slice(0, counted).filter((height) => height > 0).length);
	// A highlight merged into a record head is not drawn, so the legend follows the heads.
	const hasRecords = $derived(heads.some((head) => head.kind === 'record'));
	const hasHighlights = $derived(heads.some((head) => head.kind === 'highlight'));

	const activePath = $derived(path(ticks.map((h, day) => (day < counted ? h * 100 : 0))));
	const restPath = $derived(
		path(ticks.map((h, day) => (day >= counted || h > 0 ? 0 : REST_HEIGHT)))
	);

	function path(heights: number[]): string {
		return heights
			.map((h, day) =>
				h > 0 ? `M${day + (1 - TICK_WIDTH) / 2} 100v${-h}h${TICK_WIDTH}v${h}z` : ''
			)
			.join('');
	}

	const months = $derived(laneMonthLabels(i18n.locale));
	const monthFit = $derived(monthLabelFit(months, year));

	const label = $derived(
		[
			(yearSoFar ? i18n.m.common.yearLane.summarySoFar : i18n.m.common.yearLane.summary)(
				formatCount(i18n.locale, activeDays),
				activeDays,
				formatCount(i18n.locale, counted),
				year
			),
			hasHighlights ? i18n.m.common.yearLane.highlightsMarked : '',
			hasRecords ? i18n.m.common.yearLane.recordsMarked : ''
		]
			.filter(Boolean)
			.join(', ')
	);
</script>

<figure class="year-lane w-full" data-testid="year-lane" data-variant={variant}>
	<div role="img" aria-label={label}>
		<div class="relative {style.markers}" aria-hidden="true" bind:clientWidth={laneWidth}>
			{#each heads as { day, kind } (day)}
				<span class="marker marker-{kind}" style:left={markerLeft(day, days)}></span>
			{/each}
		</div>
		<svg
			viewBox="0 0 {days} 100"
			preserveAspectRatio="none"
			class="block w-full {style.lane}"
			aria-hidden="true"
			focusable="false"
		>
			<path d={restPath} class="rest" />
			<path d={activePath} class="active" />
		</svg>
		{#if counted < days}
			<div class="baselines" aria-hidden="true">
				<div class="baseline" style:width="{(counted / days) * 100}%"></div>
				<div class="future-baseline" style:width="{((days - counted) / days) * 100}%"></div>
			</div>
		{:else}
			<div class="baseline" aria-hidden="true"></div>
		{/if}
		<div
			class="months relative mt-2 h-[1.4em] {style.month}"
			aria-hidden="true"
			style:--month-chars={monthFit.chars}
			style:--month-share={monthFit.share}
		>
			{#each monthStartDays(year) as start, month (month)}
				<span class="month" style:left="{(start / days) * 100}%">{months[month]}</span>
			{/each}
		</div>
	</div>
	{#if hasHighlights || hasRecords}
		<figcaption class="legend mt-3 flex flex-wrap justify-end gap-x-5 gap-y-1 {style.legend}">
			{#if hasHighlights}<span class="flex items-center gap-2"
					><span class="key marker-highlight" aria-hidden="true"></span>{i18n.m.common.yearLane
						.highlight}</span
				>{/if}
			{#if hasRecords}<span class="flex items-center gap-2"
					><span class="key marker-record" aria-hidden="true"></span>{i18n.m.common.yearLane
						.record}</span
				>{/if}
		</figcaption>
	{/if}
</figure>

<style>
	.active {
		fill: var(--color-accent);
	}

	.rest {
		fill: var(--color-text-dim);
		opacity: 0.45;
	}

	.baselines {
		display: flex;
	}
	.future-baseline {
		border-top: 1px dotted var(--color-text-dim);
		opacity: 0.45;
	}
	.baseline {
		height: 1px;
		background: var(--color-text-dim);
	}

	.year-lane {
		/* Half the widest head, the record diamond scaled 1.3. */
		--marker-half: 0.325rem;
	}

	[data-variant='export'] {
		--marker-half: 12px;
	}

	/* Course points: a head above the lane on a stem that drops to the ticks. */
	.marker {
		position: absolute;
		bottom: 0;
		width: 1px;
		height: 45%;
		background: var(--color-text-dim);
		transform: translateX(-50%);
	}

	.marker::before,
	.key {
		content: '';
		display: block;
		width: 0.5rem;
		height: 0.5rem;
		box-sizing: border-box;
	}

	.marker::before {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
	}

	[data-variant='export'] .marker::before,
	[data-variant='export'] .key {
		width: 18px;
		height: 18px;
	}

	[data-variant='export'] .marker {
		width: 2px;
	}

	.marker-highlight::before,
	.key.marker-highlight {
		border: 2px solid var(--color-text-primary);
		border-radius: 9999px;
	}

	.marker-record::before,
	.key.marker-record {
		background: var(--color-text-primary);
		clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
		scale: 1.3;
	}

	[data-variant='export'] .marker-highlight::before,
	[data-variant='export'] .key.marker-highlight {
		border-width: 4px;
	}

	.months {
		container-type: inline-size;
	}

	/* One size for every label, the largest that fits the tightest month with 0.25em to spare.
	   --label-char-em is the label font's advance per character of a typical word. */
	.month {
		font-size: min(
			1em,
			100cqi * var(--month-share) / (var(--month-chars) * var(--label-char-em, 0.56) + 0.5)
		);
		position: absolute;
		top: 0;
		padding-left: 0.25em;
		border-left: 1px solid var(--color-border);
		line-height: 1.4;
		color: var(--color-text-dim);
	}

	.legend {
		color: var(--color-text-muted);
	}
</style>
