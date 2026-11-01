<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import { rankSports } from '#lib/utils/breakdown.js';
	import SectionHeading from './SectionHeading.svelte';
	import BreakdownMetricToggle from './BreakdownMetricToggle.svelte';
	import SportDonutChart from './SportDonutChart.svelte';
	import SportBars from './SportBars.svelte';

	const metric = $derived(appStore.breakdownMetric);

	const sortedBreakdown = $derived(rankSports(appStore.breakdown || [], metric));
</script>

{#if appStore.breakdown.length > 0}
	<section>
		<div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
			<SectionHeading title="By Sport" class="flex-1" />
			<BreakdownMetricToggle />
		</div>

		<div class="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
			<SportDonutChart sports={sortedBreakdown} />
			<SportBars sports={sortedBreakdown} {metric} />
		</div>
	</section>
{/if}
