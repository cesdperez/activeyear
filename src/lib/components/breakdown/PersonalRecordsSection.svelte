<script lang="ts">
	import { Trophy, Hourglass, Fire } from 'phosphor-svelte';
	import { formatDistance, formatDuration, formatCalories } from '#lib/utils/format.js';
	import type { PersonalRecords, Unit } from '#lib/types/index.js';
	import RecordCard from './RecordCard.svelte';

	let { records, unit }: { records: PersonalRecords; unit: Unit } = $props();
</script>

<div class="mb-auto">
	<div class="mb-6 flex items-center gap-6">
		<div
			class="h-1 flex-1 bg-gradient-to-l from-[var(--color-accent)] to-transparent opacity-30"
		></div>
		<h2
			class="text-[44px] font-bold tracking-widest whitespace-nowrap text-[var(--color-text-primary)] uppercase"
		>
			Personal Records
		</h2>
		<div
			class="h-1 flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-30"
		></div>
	</div>

	<div class="grid grid-cols-3 gap-6">
		{#if records.longestDistance}
			<RecordCard
				icon={Trophy}
				value={formatDistance(records.longestDistance.value, unit)}
				label="Longest Distance"
				activityTitle={records.longestDistance.activity.title}
			/>
		{/if}
		{#if records.longestDuration}
			<RecordCard
				icon={Hourglass}
				value={formatDuration(records.longestDuration.value)}
				label="Longest Duration"
				activityTitle={records.longestDuration.activity.title}
			/>
		{/if}
		{#if records.biggestBurn}
			<RecordCard
				icon={Fire}
				value={formatCalories(records.biggestBurn.value)}
				label="Biggest Burn"
				activityTitle={records.biggestBurn.activity.title}
			/>
		{/if}
	</div>
</div>
