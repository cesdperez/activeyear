<script lang="ts">
	import { sportNames, sportIcons, sportColors } from "#lib/constants/sports.js";
	import { formatDuration } from "#lib/utils/format.js";
	import type { BreakdownMetric, SportBreakdown } from "#lib/types/index.js";
	import { Target } from "phosphor-svelte";

	interface Props {
		sports: SportBreakdown[];
		metric: BreakdownMetric;
	}

	let { sports, metric }: Props = $props();

	const maxMetricValue = $derived(Math.max(...sports.map((s) => s[metric]), 1));
</script>

<div class="flex-1 space-y-6 w-full max-w-2xl">
	{#each sports as sport, i (sport.type)}
		{@const IconComponent = sportIcons[sport.type] ?? Target}
		{@const value = sport[metric]}
		{@const percentage = (value / maxMetricValue) * 100}
		{@const color = sportColors[i % sportColors.length]}

		<!-- Svelte scopes @keyframes, so this inline name never matches the one below and the bars do not animate. -->
		<div
			class="flex flex-col gap-2 group"
			style="animation: fadeInUp 0.4s ease-out forwards; animation-delay: {600 +
				i * 50}ms"
		>
			<div class="flex justify-between items-center">
				<div class="flex items-center gap-3">
					<div
						class="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
						style="background: {color}20; color: {color};"
					>
						<IconComponent class="w-5 h-5" weight="bold" />
					</div>
					<span class="font-bold text-white uppercase tracking-wide">
						{sportNames[sport.type] ?? sport.type}
					</span>
				</div>
				<div class="text-right">
					<span class="font-mono font-bold text-[var(--color-accent)]">
						{metric === "count" ? value : formatDuration(value)}
					</span>
				</div>
			</div>

			<div
				class="h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden"
			>
				<div
					class="h-full rounded-full transition-all duration-1000 ease-out"
					style="width: {percentage}%; background: {color}; box-shadow: 0 0 10px {color}40;"
				></div>
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes fadeInUp {
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
