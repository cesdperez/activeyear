<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import type { BreakdownMetric } from '#lib/types/index.js';

	const options: { metric: BreakdownMetric; label: string }[] = $derived([
		{ metric: 'count', label: i18n.m.dashboard.activities },
		{ metric: 'duration', label: i18n.m.dashboard.time }
	]);
</script>

<div
	role="group"
	aria-label={i18n.m.dashboard.breakdownMetric}
	class="flex self-start rounded-lg bg-[var(--color-surface-elevated)] p-1"
>
	{#each options as { metric, label } (metric)}
		{@const pressed = appStore.breakdownMetric === metric}
		<button
			class="rounded-md px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 {pressed
				? 'bg-[var(--color-accent)] text-black'
				: 'text-[var(--color-text-dim)] enabled:hover:text-white'} disabled:cursor-not-allowed disabled:opacity-50"
			aria-pressed={pressed}
			disabled={appStore.isExporting}
			onclick={() => (appStore.breakdownMetric = metric)}
		>
			{label}
		</button>
	{/each}
</div>
