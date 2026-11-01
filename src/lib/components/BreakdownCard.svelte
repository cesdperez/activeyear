<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import { selectTopSports, sportColorsFor } from '#lib/utils/breakdown.js';
	import ExportCardBase from './ExportCardBase.svelte';
	import SportDistribution from './breakdown/SportDistribution.svelte';
	import WeeklyPattern from './widgets/WeeklyPattern.svelte';
	import ConsistencyStats from './widgets/ConsistencyStats.svelte';
	import PersonalRecordsSection from './breakdown/PersonalRecordsSection.svelte';

	let topSports = $derived(selectTopSports(appStore.breakdown || [], appStore.breakdownMetric));
	let colors = $derived(sportColorsFor(appStore.breakdown || []));
</script>

<ExportCardBase variant="breakdown" title="BREAKDOWN">
	{#if topSports.length > 0}
		<SportDistribution sports={topSports} {colors} metric={appStore.breakdownMetric} />
	{/if}

	<WeeklyPattern variant="export" pattern={appStore.weeklyPattern} theme={appStore.theme} />

	<ConsistencyStats
		variant="export"
		activeDays={appStore.stats?.activeDays ?? 0}
		longestStreak={appStore.stats?.longestStreak ?? 0}
	/>

	{#if appStore.records}
		<PersonalRecordsSection records={appStore.records} unit={appStore.unit} />
	{/if}
</ExportCardBase>
