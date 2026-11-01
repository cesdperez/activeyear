<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import RecordCard from '#lib/components/widgets/RecordCard.svelte';
	import { formatDistance, formatDuration, formatCalories } from '#lib/utils/format.js';
	import { Fire, Trophy, Hourglass } from 'phosphor-svelte';
	import SectionHeading from './SectionHeading.svelte';
</script>

{#if appStore.records}
	<section class="mb-16">
		<SectionHeading title="Personal Records" />

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			{#if appStore.records.longestDistance}
				<RecordCard
					variant="dashboard"
					icon={Trophy}
					value={formatDistance(appStore.records.longestDistance.value, appStore.unit)}
					label="Longest Distance"
					activityTitle={appStore.records.longestDistance.activity.title}
					delay={450}
				/>
			{/if}
			{#if appStore.records.longestDuration}
				<RecordCard
					variant="dashboard"
					icon={Hourglass}
					value={formatDuration(appStore.records.longestDuration.value)}
					label="Longest Duration"
					activityTitle={appStore.records.longestDuration.activity.title}
					delay={500}
				/>
			{/if}
			{#if appStore.records.biggestBurn}
				<RecordCard
					variant="dashboard"
					icon={Fire}
					value={formatCalories(appStore.records.biggestBurn.value)}
					label="Biggest Burn"
					activityTitle={appStore.records.biggestBurn.activity.title}
					delay={550}
				/>
			{/if}
		</div>
	</section>
{/if}
