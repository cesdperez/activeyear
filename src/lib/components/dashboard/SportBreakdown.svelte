<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import { consolidateBreakdown } from "#lib/utils/activity.js";
	import SectionHeading from "./SectionHeading.svelte";
	import BreakdownMetricToggle from "./BreakdownMetricToggle.svelte";
	import SportDonutChart from "./SportDonutChart.svelte";
	import SportBars from "./SportBars.svelte";

	const metric = $derived(appStore.breakdownMetric);

	const consolidatedBreakdown = $derived(
		consolidateBreakdown(appStore.breakdown || []),
	);

	const sortedBreakdown = $derived(
		[...consolidatedBreakdown].sort((a, b) => b[metric] - a[metric]),
	);
</script>

{#if appStore.breakdown.length > 0}
	<section>
		<div
			class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
		>
			<SectionHeading title="By Sport" class="flex-1" />
			<BreakdownMetricToggle />
		</div>

		<div class="flex flex-col lg:flex-row items-center lg:items-start gap-12">
			<SportDonutChart sports={sortedBreakdown} />
			<SportBars sports={sortedBreakdown} {metric} />
		</div>
	</section>
{/if}
