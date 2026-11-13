<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { selectTopSports, sportColorsFor } from '#lib/utils/breakdown.js';
	import ExportCardBase from './ExportCardBase.svelte';
	import SportDistribution from './breakdown/SportDistribution.svelte';
	import WeeklyPattern from './widgets/WeeklyPattern.svelte';
	import ConsistencyStats from './widgets/ConsistencyStats.svelte';
	import PersonalRecordsSection from './breakdown/PersonalRecordsSection.svelte';

	let topSports = $derived(selectTopSports(appStore.breakdown || [], appStore.breakdownMetric));
	let colors = $derived(sportColorsFor(topSports, appStore.theme));
</script>

<ExportCardBase variant="breakdown" title={i18n.m.export.breakdown}>
	{#if topSports.length > 0}
		<SportDistribution sports={topSports} {colors} metric={appStore.breakdownMetric} />
	{/if}

	<WeeklyPattern variant="export" pattern={appStore.weeklyPattern} theme={appStore.theme} />

	<ConsistencyStats
		activeDays={appStore.stats?.activeDays ?? 0}
		longestStreak={appStore.stats?.longestStreak ?? 0}
		yearSoFar={appStore.yearSoFar}
		daysCounted={appStore.daysCounted}
	/>

	{#if appStore.records}
		<PersonalRecordsSection records={appStore.records} unit={appStore.unit} />
	{/if}
</ExportCardBase>
