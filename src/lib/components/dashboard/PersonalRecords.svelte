<script lang="ts">
	import type { PersonalRecords, Unit } from '#lib/types/index.js';
	import RecordCard from '#lib/components/widgets/RecordCard.svelte';
	import { formatDistance, formatDuration, formatCalories } from '#lib/utils/format.js';
	import { Fire, Trophy, Hourglass } from 'phosphor-svelte';
	import SectionHeading from './SectionHeading.svelte';

	let { records, unit }: { records: PersonalRecords | null; unit: Unit } = $props();
</script>

{#if records}
	<section class="mb-16">
		<SectionHeading title="Personal Records" />

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			{#if records.longestDistance}
				<RecordCard
					variant="dashboard"
					icon={Trophy}
					value={formatDistance(records.longestDistance.value, unit)}
					label="Longest Distance"
					activityTitle={records.longestDistance.activity.title}
					delay={450}
				/>
			{/if}
			{#if records.longestDuration}
				<RecordCard
					variant="dashboard"
					icon={Hourglass}
					value={formatDuration(records.longestDuration.value)}
					label="Longest Duration"
					activityTitle={records.longestDuration.activity.title}
					delay={500}
				/>
			{/if}
			{#if records.biggestBurn}
				<RecordCard
					variant="dashboard"
					icon={Fire}
					value={formatCalories(records.biggestBurn.value)}
					label="Biggest Burn"
					activityTitle={records.biggestBurn.activity.title}
					delay={550}
				/>
			{/if}
		</div>
	</section>
{/if}
