<script lang="ts">
	import SportDonut from '#lib/components/widgets/SportDonut.svelte';
	import SportBars from './SportBars.svelte';
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';

	let {
		sports,
		metric,
		totalActivities
	}: {
		sports: SportBreakdown[];
		metric: BreakdownMetric;
		totalActivities: number;
	} = $props();
</script>

<div class="mb-32 flex items-center gap-12 px-4">
	<SportDonut variant="export" {sports} {totalActivities} />
	<SportBars {sports} {metric} />
</div>
