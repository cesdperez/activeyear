<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { Trophy, Hourglass, Fire } from 'phosphor-svelte';
	import { formatDistance, formatDuration, formatCalories } from '#lib/utils/format.js';
	import type { PersonalRecords, Unit, WidgetVariant } from '#lib/types/index.js';
	import RecordCard from './RecordCard.svelte';

	interface Props {
		records: PersonalRecords;
		unit: Unit;
		variant: WidgetVariant;
		/** Dashboard entrance delay in ms of the first card; each next card waits 50 ms more. */
		delay?: number;
	}

	let { records, unit, variant, delay = 0 }: Props = $props();

	const cards = $derived([
		{
			icon: Trophy,
			label: 'Longest Distance',
			record: records.longestDistance,
			format: (value: number) => formatDistance(i18n.locale, value, unit)
		},
		{
			icon: Hourglass,
			label: 'Longest Duration',
			record: records.longestDuration,
			format: (value: number) => formatDuration(i18n.locale, value)
		},
		{
			icon: Fire,
			label: 'Biggest Burn',
			record: records.biggestBurn,
			format: (value: number) => formatCalories(i18n.locale, value)
		}
	]);
</script>

{#each cards as { icon, label, record, format }, i (label)}
	{#if record}
		<RecordCard
			{variant}
			{icon}
			value={format(record.value)}
			{label}
			activityTitle={record.activity.title}
			delay={delay + i * 50}
		/>
	{/if}
{/each}
