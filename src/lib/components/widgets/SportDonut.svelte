<script lang="ts">
	import { donutCentre, sportDonutSegments, type SportColors } from '#lib/utils/breakdown.js';
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

	// Matches the r="80" of the circles below.
	const circumference = 2 * Math.PI * 80;

	const isDashboard = $derived(variant === 'dashboard');
	const segments = $derived(sportDonutSegments(sports, colors, metric, circumference, variant));
	const centre = $derived(donutCentre(sports, metric));
</script>

<div class="relative shrink-0">
	<div
		class={isDashboard
			? 'donut-chart-container !h-[280px] !w-[280px] md:!h-[340px] md:!w-[340px]'
			: 'donut-chart-container !h-[280px] !w-[280px]'}
	>
		<!-- The ring is decorative; the legend and centre text carry the information. -->
		<svg viewBox="0 0 200 200" class="donut-chart" aria-hidden="true" focusable="false">
			<circle
				cx="100"
				cy="100"
				r="80"
				fill="none"
				stroke={isDashboard ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
				class={isDashboard ? undefined : 'donut-bg'}
				stroke-width="28"
			/>
			{#each segments as segment, i (i)}
				{@const color = segment.color}
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="none"
					stroke={color}
					stroke-width="28"
					stroke-dasharray={segment.dashArray}
					stroke-dashoffset={-segment.offset}
					stroke-linecap="butt"
					transform="rotate(-90 100 100)"
					class="donut-segment"
					style="filter: drop-shadow(0 0 8px {color}40);"
				/>
			{/each}
			{#if !isDashboard}
				<text
					x="100"
					y="95"
					text-anchor="middle"
					dominant-baseline="central"
					fill="var(--color-text-primary)"
					style="font-size: 52px; font-weight: 900; font-family: inherit;">{centre.value}</text
				>
				<text
					x="100"
					y="130"
					text-anchor="middle"
					dominant-baseline="central"
					fill="var(--color-text-muted)"
					style="font-size: 14px; font-weight: 700; font-family: inherit; letter-spacing: 0.1em; text-transform: uppercase;"
					>{centre.label}</text
				>
			{/if}
		</svg>

		{#if isDashboard}
			<div class="donut-center">
				<div class="text-4xl leading-none font-black text-white md:text-5xl">
					{centre.value}
				</div>
				<div
					class="mt-1 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase md:text-sm"
				>
					{centre.label}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.donut-chart-container {
		position: relative;
	}

	.donut-chart {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.donut-segment {
		transition: stroke-dasharray 0.3s ease;
	}

	.donut-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}
</style>
