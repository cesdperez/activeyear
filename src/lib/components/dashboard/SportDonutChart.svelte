<script lang="ts">
	import { sportColors } from "#lib/constants/sports.js";
	import { donutSegments } from "#lib/utils/charts.js";
	import type { SportBreakdown } from "#lib/types/index.js";

	interface Props {
		sports: SportBreakdown[];
	}

	let { sports }: Props = $props();

	const circumference = 2 * Math.PI * 80;

	const totalCount = $derived(sports.reduce((sum, s) => sum + s.count, 0));
	const segments = $derived(
		donutSegments(
			sports.map((s) => s.count),
			circumference,
		),
	);
</script>

<div class="shrink-0 relative">
	<div
		class="donut-chart-container !w-[280px] !h-[280px] md:!w-[340px] md:!h-[340px]"
	>
		<svg viewBox="0 0 200 200" class="donut-chart">
			<circle
				cx="100"
				cy="100"
				r="80"
				fill="none"
				stroke="rgba(255,255,255,0.05)"
				stroke-width="28"
			/>
			{#each segments as segment, i}
				{@const color = sportColors[i % sportColors.length]}
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="none"
					stroke={color}
					stroke-width="28"
					stroke-dasharray="{segment.share * circumference -
						2} {circumference}"
					stroke-dashoffset={-segment.offset}
					stroke-linecap="round"
					transform="rotate(-90 100 100)"
					class="donut-segment"
					style="filter: drop-shadow(0 0 8px {color}40);"
				/>
			{/each}
		</svg>

		<div class="donut-center">
			<div class="text-4xl md:text-5xl font-black text-white leading-none">
				{totalCount}
			</div>
			<div
				class="text-xs md:text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-1"
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
