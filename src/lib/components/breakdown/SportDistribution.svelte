<script lang="ts">
	import SportDonut from '#lib/components/widgets/SportDonut.svelte';
	import SportBars from '#lib/components/widgets/SportBars.svelte';
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';

	let { sports, metric }: { sports: SportBreakdown[]; metric: BreakdownMetric } = $props();
</script>

<div class="mb-32 flex items-center gap-12 px-4">
	<SportDonut variant="export" {sports} {metric} />
	<SportBars variant="export" {sports} {metric} />
</div>
