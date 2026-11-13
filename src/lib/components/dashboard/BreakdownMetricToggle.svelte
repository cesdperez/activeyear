<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import type { BreakdownMetric } from '#lib/types/index.js';

	const options: { metric: BreakdownMetric; label: string }[] = $derived([
		{ metric: 'count', label: i18n.m.dashboard.activities },
		{ metric: 'duration', label: i18n.m.dashboard.time }
	]);
</script>

<div role="group" aria-label={i18n.m.dashboard.breakdownMetric} class="segmented self-start">
	{#each options as { metric, label } (metric)}
		<button
			aria-pressed={exportSettings.breakdownMetric === metric}
			disabled={exportLock.isExporting}
			onclick={() => (exportSettings.breakdownMetric = metric)}
		>
			{label}
		</button>
	{/each}
</div>
