<script lang="ts">
	import { sportColors } from '#lib/constants/sports.js';
	import { donutSegments } from '#lib/utils/charts.js';
	import type { SportBreakdown } from '#lib/types/index.js';

	interface Props {
		sports: SportBreakdown[];
	}

	let { sports }: Props = $props();

	const circumference = 2 * Math.PI * 80;

	const totalCount = $derived(sports.reduce((sum, s) => sum + s.count, 0));
	const segments = $derived(
		donutSegments(
			sports.map((s) => s.count),
			circumference
		)
	);
</script>

<div class="relative shrink-0">
	<div class="donut-chart-container !h-[280px] !w-[280px] md:!h-[340px] md:!w-[340px]">
		<svg viewBox="0 0 200 200" class="donut-chart">
			<circle
				cx="100"
				cy="100"
				r="80"
				fill="none"
				stroke="rgba(255,255,255,0.05)"
				stroke-width="28"
			/>
			{#each segments as segment, i (i)}
				{@const color = sportColors[i % sportColors.length]}
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="none"
					stroke={color}
					stroke-width="28"
					stroke-dasharray="{segment.share * circumference - 2} {circumference}"
					stroke-dashoffset={-segment.offset}
					stroke-linecap="round"
					transform="rotate(-90 100 100)"
					class="donut-segment"
					style="filter: drop-shadow(0 0 8px {color}40);"
				/>
			{/each}
		</svg>

		<div class="donut-center">
			<div class="text-4xl leading-none font-black text-white md:text-5xl">
				{totalCount}
			</div>
			<div
				class="mt-1 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase md:text-sm"
			>
				Activities
			</div>
		</div>
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
