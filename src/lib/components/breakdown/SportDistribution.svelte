<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import SportDonut from '#lib/components/widgets/SportDonut.svelte';
	import SportBars from '#lib/components/widgets/SportBars.svelte';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';
	import type { SportColors } from '#lib/utils/breakdown.js';
	import type { BreakdownMetric, SportBreakdown } from '#lib/types/index.js';

	let {
		sports,
		colors,
		metric
	}: { sports: SportBreakdown[]; colors: SportColors; metric: BreakdownMetric } = $props();
</script>

<section class="mb-[36px]">
	<SectionHeading title={i18n.m.export.sports} variant="export" />
	<div class="flex items-center gap-12">
		<SportDonut variant="export" theme={exportSettings.theme} {sports} {colors} {metric} />
		<SportBars variant="export" theme={exportSettings.theme} {sports} {colors} {metric} />
	</div>
</section>
