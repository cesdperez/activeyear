<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import type { BreakdownMetric } from '#lib/types/index.js';

	const options: { metric: BreakdownMetric; label: string }[] = [
		{ metric: 'count', label: 'Activities' },
		{ metric: 'duration', label: 'Time' }
	];
</script>

<div
	role="group"
	aria-label="Breakdown metric"
	class="flex self-start rounded-lg bg-[var(--color-surface-elevated)] p-1"
>
	{#each options as { metric, label } (metric)}
		{@const pressed = appStore.breakdownMetric === metric}
		<button
			class="rounded-md px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 {pressed
				? 'bg-[var(--color-accent)] text-black'
				: 'text-[var(--color-text-dim)] hover:text-white'}"
			aria-pressed={pressed}
			onclick={() => (appStore.breakdownMetric = metric)}
		>
			{label}
		</button>
	{/each}
</div>
