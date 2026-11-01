<script lang="ts">
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';
	import { rankSports } from '#lib/utils/breakdown.js';
	import SectionHeading from './SectionHeading.svelte';
	import BreakdownMetricToggle from './BreakdownMetricToggle.svelte';
	import SportDonut from '#lib/components/widgets/SportDonut.svelte';
	import SportBars from '#lib/components/widgets/SportBars.svelte';

	let { breakdown, metric }: { breakdown: SportBreakdown[]; metric: BreakdownMetric } = $props();

	const sortedBreakdown = $derived(rankSports(breakdown, metric));
	const totalCount = $derived(sortedBreakdown.reduce((sum, s) => sum + s.count, 0));
</script>

{#if breakdown.length > 0}
	<section>
		<div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
			<SectionHeading title="By Sport" class="flex-1" />
			<BreakdownMetricToggle />
		</div>

		<div class="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
			<SportDonut variant="dashboard" sports={sortedBreakdown} totalActivities={totalCount} />
			<SportBars variant="dashboard" sports={sortedBreakdown} {metric} />
		</div>
	</section>
{/if}
