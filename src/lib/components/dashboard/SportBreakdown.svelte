<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';
	import { rankSports, sportColorsFor } from '#lib/utils/breakdown.js';
	import SectionHeading from './SectionHeading.svelte';
	import BreakdownMetricToggle from './BreakdownMetricToggle.svelte';
	import SportDonut from '#lib/components/widgets/SportDonut.svelte';
	import SportBars from '#lib/components/widgets/SportBars.svelte';

	let { breakdown, metric }: { breakdown: SportBreakdown[]; metric: BreakdownMetric } = $props();

	const sortedBreakdown = $derived(rankSports(breakdown, metric));
	const colors = $derived(sportColorsFor(breakdown));
</script>

{#if breakdown.length > 0}
	<section data-testid="sport-breakdown" class="mb-16">
		<div
			data-section-lead
			class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-baseline"
		>
			<SectionHeading title={i18n.m.dashboard.bySport} class="mb-0 md:mb-0" />
			<BreakdownMetricToggle />
		</div>

		<div class="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
			<SportDonut variant="dashboard" sports={sortedBreakdown} {colors} {metric} />
			<SportBars variant="dashboard" sports={sortedBreakdown} {colors} {metric} />
		</div>
	</section>
{/if}
