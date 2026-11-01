<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import { rankSports } from '#lib/utils/breakdown.js';
	import SectionHeading from './SectionHeading.svelte';
	import BreakdownMetricToggle from './BreakdownMetricToggle.svelte';
	import SportDonut from '#lib/components/widgets/SportDonut.svelte';
	import SportBars from '#lib/components/widgets/SportBars.svelte';

	const metric = $derived(appStore.breakdownMetric);

	const sortedBreakdown = $derived(rankSports(appStore.breakdown || [], metric));
	const totalCount = $derived(sortedBreakdown.reduce((sum, s) => sum + s.count, 0));
</script>

{#if appStore.breakdown.length > 0}
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
