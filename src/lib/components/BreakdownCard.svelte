<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { yearData } from '#lib/stores/yearData.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { selectTopSports, sportColorsFor } from '#lib/utils/breakdown.js';
	import ExportCardBase from './ExportCardBase.svelte';
	import SportDistribution from './breakdown/SportDistribution.svelte';
	import WeeklyPattern from './widgets/WeeklyPattern.svelte';
	import ConsistencyStats from './widgets/ConsistencyStats.svelte';
	import PersonalRecordsSection from './breakdown/PersonalRecordsSection.svelte';

	let topSports = $derived(
		selectTopSports(yearData.breakdown || [], exportSettings.breakdownMetric)
	);
	let colors = $derived(sportColorsFor(topSports, exportSettings.theme));
</script>

<ExportCardBase variant="breakdown" title={i18n.m.export.breakdown}>
	{#if topSports.length > 0}
		<SportDistribution sports={topSports} {colors} metric={exportSettings.breakdownMetric} />
	{/if}

	<WeeklyPattern variant="export" pattern={yearData.weeklyPattern} theme={exportSettings.theme} />

	<ConsistencyStats
		activeDays={yearData.stats?.activeDays ?? 0}
		longestStreak={yearData.stats?.longestStreak ?? 0}
		yearSoFar={yearData.yearSoFar}
		daysCounted={yearData.daysCounted}
	/>

	{#if yearData.records}
		<PersonalRecordsSection records={yearData.records} unit={exportSettings.unit} />
	{/if}
</ExportCardBase>
