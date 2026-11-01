<script lang="ts">
	import { sportNames, sportIcons, sportColors } from '#lib/constants/sports.js';
	import { formatDuration } from '#lib/utils/format.js';
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';
	import { Target } from 'phosphor-svelte';

	interface Props {
		sports: SportBreakdown[];
		metric: BreakdownMetric;
	}

	let { sports, metric }: Props = $props();

	const maxMetricValue = $derived(Math.max(...sports.map((s) => s[metric]), 1));
</script>

<div class="w-full max-w-2xl flex-1 space-y-6">
	{#each sports as sport, i (sport.type)}
		{@const IconComponent = sportIcons[sport.type] ?? Target}
		{@const value = sport[metric]}
		{@const percentage = (value / maxMetricValue) * 100}
		{@const color = sportColors[i % sportColors.length]}

		<div
			class="group flex flex-col gap-2"
			style="animation: fadeInUp 0.4s ease-out both; animation-delay: {600 + i * 50}ms"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
						style="background: {color}20; color: {color};"
					>
						<IconComponent class="h-5 w-5" weight="bold" />
					</div>
					<span class="font-bold tracking-wide text-white uppercase">
						{sportNames[sport.type] ?? sport.type}
					</span>
				</div>
				<div class="text-right">
					<span class="font-mono font-bold text-[var(--color-accent)]">
						{metric === 'count' ? value : formatDuration(value)}
					</span>
				</div>
			</div>

			<div class="h-2 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
				<div
					class="h-full rounded-full transition-all duration-1000 ease-out"
					style="width: {percentage}%; background: {color}; box-shadow: 0 0 10px {color}40;"
				></div>
			</div>
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
