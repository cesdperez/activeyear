<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import { selectTopSports } from '#lib/utils/breakdown.js';
	import ExportCardBase from './ExportCardBase.svelte';
	import SportDistribution from './breakdown/SportDistribution.svelte';
	import WeeklyPatternChart from './breakdown/WeeklyPatternChart.svelte';
	import ConsistencyStats from './breakdown/ConsistencyStats.svelte';
	import PersonalRecordsSection from './breakdown/PersonalRecordsSection.svelte';

	let topSports = $derived(selectTopSports(appStore.breakdown || [], appStore.breakdownMetric));
</script>

<ExportCardBase variant="breakdown" title="BREAKDOWN">
	{#if topSports.length > 0}
		<SportDistribution
			sports={topSports}
			metric={appStore.breakdownMetric}
			totalActivities={appStore.stats?.activityCount ?? 0}
		/>
	{/if}

	{#if appStore.weeklyPattern.some((v) => v > 0)}
		<WeeklyPatternChart pattern={appStore.weeklyPattern} theme={appStore.theme} />
	{/if}

	<ConsistencyStats
		activeDays={appStore.stats?.activeDays ?? 0}
		longestStreak={appStore.stats?.longestStreak ?? 0}
	/>

	{#if appStore.records}
		<PersonalRecordsSection records={appStore.records} unit={appStore.unit} />
	{/if}
</ExportCardBase>
