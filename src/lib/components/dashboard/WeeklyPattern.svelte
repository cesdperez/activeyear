<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import { WEEKDAY_LABELS } from "#lib/constants/time.js";
	import { scaledBarHeight, topIndices } from "#lib/utils/charts.js";
	import SectionHeading from "./SectionHeading.svelte";

	const barContainerHeight = 160;
	const minBarHeight = 8;

	const hasActivity = $derived(appStore.weeklyPattern.some((v) => v > 0));
	const maxDay = $derived(Math.max(...appStore.weeklyPattern, 1));
	const topDays = $derived(topIndices(appStore.weeklyPattern, 2));
</script>

{#if hasActivity}
	<section class="mb-16">
		<SectionHeading title="When You Train" />

		<div
			class="flex items-end justify-between gap-4 px-4"
			style="height: {barContainerHeight + 60}px;"
		>
			{#each appStore.weeklyPattern as count, i}
				{@const barHeight = scaledBarHeight(
					count,
					maxDay,
					barContainerHeight,
					minBarHeight,
				)}
				{@const isTopDay = topDays.includes(i)}
				<div class="flex-1 flex flex-col items-center justify-end gap-3">
					<span class="text-sm font-mono text-[var(--color-text-muted)]">
						{count}
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
					<span
						class="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider"
					>
						{WEEKDAY_LABELS[i]}
					</span>
				</div>
			{/each}
		</div>
	</section>
{/if}
