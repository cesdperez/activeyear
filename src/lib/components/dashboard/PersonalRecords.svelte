<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import PersonalRecordCard from "#lib/components/PersonalRecordCard.svelte";
	import {
		formatDistance,
		formatDuration,
		formatCalories,
	} from "#lib/utils/format.js";
	import { Fire, Trophy, Hourglass } from "phosphor-svelte";
	import SectionHeading from "./SectionHeading.svelte";
</script>

{#if appStore.records}
	<section class="mb-16">
		<SectionHeading title="Personal Records" />

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#if appStore.records.longestDistance}
				<PersonalRecordCard
					value={formatDistance(
						appStore.records.longestDistance.value,
						appStore.unit,
					)}
					label="Longest Distance"
					detail={appStore.records.longestDistance.activity.title}
					delay={450}
				>
					{#snippet icon()}
						<Trophy weight="fill" />
					{/snippet}
				</PersonalRecordCard>
			{/if}
			{#if appStore.records.longestDuration}
				<PersonalRecordCard
					value={formatDuration(appStore.records.longestDuration.value)}
					label="Longest Duration"
					detail={appStore.records.longestDuration.activity.title}
					delay={500}
				>
					{#snippet icon()}
						<Hourglass weight="fill" />
					{/snippet}
				</PersonalRecordCard>
			{/if}
			{#if appStore.records.biggestBurn}
				<PersonalRecordCard
					value={formatCalories(appStore.records.biggestBurn.value)}
					label="Biggest Burn"
					detail={appStore.records.biggestBurn.activity.title}
					delay={550}
				>
					{#snippet icon()}
						<Fire weight="fill" />
					{/snippet}
				</PersonalRecordCard>
			{/if}
		</div>
	</section>
{/if}
