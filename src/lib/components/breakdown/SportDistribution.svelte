<script lang="ts">
	import SportDonut from '#lib/components/widgets/SportDonut.svelte';
	import SportBars from '#lib/components/widgets/SportBars.svelte';
	import type { SportColors } from '#lib/utils/breakdown.js';
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';

	let {
		sports,
		colors,
		metric
	}: { sports: SportBreakdown[]; colors: SportColors; metric: BreakdownMetric } = $props();
</script>

<div class="mb-32 flex items-center gap-12 px-4">
	<SportDonut variant="export" {sports} {colors} {metric} />
	<SportBars variant="export" {sports} {colors} {metric} />
</div>
