<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { formatDistance, formatDuration, formatCalories } from '#lib/utils/format.js';
	import type { PersonalRecords, Unit, WidgetVariantProps } from '#lib/types/index.js';
	import RecordCard from './RecordCard.svelte';

	type Props = { records: PersonalRecords; unit: Unit } & WidgetVariantProps;

	let { records, unit, ...variantProps }: Props = $props();

	const cards = $derived([
		{
			label: i18n.m.dashboard.longestDistance,
			record: records.longestDistance,
			format: (value: number) => formatDistance(i18n.locale, value, unit)
		},
		{
			label: i18n.m.dashboard.longestDuration,
			record: records.longestDuration,
			format: (value: number) => formatDuration(i18n.locale, value)
		},
		{
			label: i18n.m.dashboard.biggestBurn,
			record: records.biggestBurn,
			format: (value: number) => formatCalories(i18n.locale, value)
		}
	]);
</script>

{#each cards as { label, record, format } (label)}
	{#if record}
		<RecordCard
			{...variantProps}
			value={format(record.value)}
			{label}
			activityTitle={record.activity.title}
		/>
	{/if}
{/each}
