<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import type { BreakdownMetric } from '#lib/types/index.js';

	const options: { metric: BreakdownMetric; label: string }[] = $derived([
		{ metric: 'count', label: i18n.m.dashboard.activities },
		{ metric: 'duration', label: i18n.m.dashboard.time }
	]);
</script>

<div role="group" aria-label={i18n.m.dashboard.breakdownMetric} class="segmented self-start">
	{#each options as { metric, label } (metric)}
		<button
			aria-pressed={appStore.breakdownMetric === metric}
			disabled={appStore.isExporting}
			onclick={() => (appStore.breakdownMetric = metric)}
		>
			{label}
		</button>
	{/each}
</div>
