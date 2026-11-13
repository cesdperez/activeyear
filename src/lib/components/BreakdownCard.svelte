<script lang="ts">
	import type {
		WeeklyPattern as WeeklyPatternType,
		PersonalRecords,
		Unit,
		Theme,
		BreakdownMetric,
		BreakdownCardModel
	} from '#lib/types/index.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import ExportCardBase from './ExportCardBase.svelte';
	import SportDistribution from './breakdown/SportDistribution.svelte';
	import WeeklyPattern from './widgets/WeeklyPattern.svelte';
	import ConsistencyStats from './widgets/ConsistencyStats.svelte';
	import PersonalRecordsSection from './breakdown/PersonalRecordsSection.svelte';

	let {
		model,
		weeklyPattern,
		records,
		unit,
		theme,
		breakdownMetric,
		displayName,
		yearSoFar,
		daysCounted
	}: {
		model: BreakdownCardModel;
		weeklyPattern: WeeklyPatternType;
		records: PersonalRecords | null;
		unit: Unit;
		theme: Theme;
		breakdownMetric: BreakdownMetric;
		displayName: string;
		yearSoFar: boolean;
		daysCounted: number;
	} = $props();
	let { topSports, colors, activeDays, longestStreak } = $derived(model);
</script>

<ExportCardBase
	{theme}
	{displayName}
	{yearSoFar}
	variant="breakdown"
	title={i18n.m.export.breakdown}
>
	{#if topSports.length > 0}
		<SportDistribution sports={topSports} {colors} metric={breakdownMetric} {theme} />
	{/if}

	<WeeklyPattern variant="export" pattern={weeklyPattern} {theme} />

	<ConsistencyStats {activeDays} {longestStreak} {yearSoFar} {daysCounted} />

	{#if records}
		<PersonalRecordsSection {records} {unit} {theme} />
	{/if}
</ExportCardBase>
