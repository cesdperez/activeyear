<script lang="ts">
	import { weeklyBars } from '#lib/utils/breakdown.js';
	import type { Theme, WeeklyPattern } from '#lib/types/index.js';

	let { pattern, theme }: { pattern: WeeklyPattern; theme: Theme } = $props();

	const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
	const barContainerHeight = 100;

	let bars = $derived(weeklyBars(pattern, barContainerHeight));
</script>

<div class="mb-16 px-2">
	<div
		class="mb-4 text-center text-[18px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase"
	>
		When You Train
	</div>
	<div class="flex items-end justify-between gap-3" style="height: {barContainerHeight + 28}px;">
		{#each bars as { heightPercent, barHeight, isTopDay }, i (i)}
			<div class="flex flex-1 flex-col items-center justify-end gap-2">
				<div
					class="weekly-bar w-full rounded-t-lg transition-all"
					style="height: {barHeight}px; background: {isTopDay
						? '#00ff88'
						: 'var(--color-accent)'}; opacity: {theme === 'minimalist'
						? 0.8
						: 0.4 + (heightPercent / 100) * 0.6};"
				></div>
				<span class="text-[16px] font-bold text-[var(--color-text-muted)]">
					{dayLabels[i]}
				</span>
			</div>
		{/each}
	</div>
</div>
