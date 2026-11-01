<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import StatCard from "#lib/components/StatCard.svelte";
	import {
		formatDistance,
		formatDuration,
		formatCalories,
		formatElevation,
		formatEarthLaps,
		formatEverests,
		formatPizzaSlices,
		formatLotRMarathons,
	} from "#lib/utils/format.js";
	import { Ruler, Timer, Fire, Mountains } from "phosphor-svelte";
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
	<StatCard
		value={formatDistance(appStore.stats?.totalDistance ?? 0, appStore.unit)}
		label="Total Distance"
		delay={0}
		equivalent={`🌍 ${formatEarthLaps(appStore.stats?.totalDistance ?? 0)}`}
	>
		{#snippet icon()}
			<Ruler weight="bold" />
		{/snippet}
	</StatCard>

	<StatCard
		value={formatElevation(appStore.stats?.totalElevation ?? 0, appStore.unit)}
		label="Elevation Gained"
		delay={150}
		equivalent={`🏔️ ${formatEverests(appStore.stats?.totalElevation ?? 0)}`}
	>
		{#snippet icon()}
			<Mountains weight="bold" />
		{/snippet}
	</StatCard>

	<StatCard
		value={formatDuration(appStore.stats?.totalDuration ?? 0)}
		label="Time Active"
		delay={50}
		equivalent={`💍 ${formatLotRMarathons(appStore.stats?.totalDuration ?? 0)}`}
	>
		{#snippet icon()}
			<Timer weight="bold" />
		{/snippet}
	</StatCard>

	<StatCard
		value={formatCalories(appStore.stats?.totalCalories ?? 0)}
		label="Calories Burned"
		delay={100}
		equivalent={`🍕 ${formatPizzaSlices(appStore.stats?.totalCalories ?? 0)}`}
	>
		{#snippet icon()}
			<Fire weight="bold" />
		{/snippet}
	</StatCard>
</div>
