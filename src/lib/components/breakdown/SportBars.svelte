<script lang="ts">
	import { Target } from 'phosphor-svelte';
	import { sportNames, sportIcons, sportColors } from '#lib/constants/sports.js';
	import { formatDuration } from '#lib/utils/format.js';
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';

	let { sports, metric }: { sports: SportBreakdown[]; metric: BreakdownMetric } = $props();

	const maxValue = $derived(Math.max(...sports.map((s) => s[metric]), 1));
</script>

<div class="flex-1 space-y-6">
	{#each sports as sport, i (sport.type)}
		{@const IconComponent = sportIcons[sport.type] ?? Target}
		{@const value = sport[metric]}
		{@const percentage = (value / maxValue) * 100}
		{@const color = sportColors[i % sportColors.length]}

		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg"
						style="background: {color}20; color: {color};"
					>
						<IconComponent class="h-5 w-5" weight="bold" />
					</div>
					<span
						class="text-[24px] font-bold tracking-wide text-[var(--color-text-primary)] uppercase"
					>
						{sportNames[sport.type] ?? sport.type}
					</span>
				</div>
				<div class="text-right">
					<div
						class="text-[22px] leading-none font-bold whitespace-nowrap text-[var(--color-text-primary)]"
					>
						{metric === 'count' ? value : formatDuration(value)}
					</div>
				</div>
			</div>
			<div class="sport-bar-bg h-3 overflow-hidden rounded-full bg-[rgba(0,0,0,0.05)]">
				<div
					class="h-full rounded-full transition-all duration-500"
					style="width: {percentage}%; background: {color}; filter: drop-shadow(0 0 4px {color}40);"
				></div>
			</div>
		</div>
	{/each}
</div>
