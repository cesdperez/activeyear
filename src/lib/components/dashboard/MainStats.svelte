<script lang="ts">
	import type { Unit, YearStats } from '#lib/types/index.js';
	import StatCard from '#lib/components/StatCard.svelte';
	import {
		formatDistance,
		formatDuration,
		formatCalories,
		formatElevation,
		formatEarthLaps,
		formatEverests,
		formatPizzaSlices,
		formatLotRMarathons
	} from '#lib/utils/format.js';
	import { Ruler, Timer, Fire, Mountains } from 'phosphor-svelte';

	let { stats, unit }: { stats: YearStats | null; unit: Unit } = $props();
</script>

<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
	<StatCard
		value={formatDistance(stats?.totalDistance ?? 0, unit)}
		label="Total Distance"
		delay={0}
		equivalent={`🌍 ${formatEarthLaps(stats?.totalDistance ?? 0)}`}
	>
		{#snippet icon()}
			<Ruler weight="bold" />
		{/snippet}
	</StatCard>

	<StatCard
		value={formatElevation(stats?.totalElevation ?? 0, unit)}
		label="Elevation Gained"
		delay={150}
		equivalent={`🏔️ ${formatEverests(stats?.totalElevation ?? 0)}`}
	>
		{#snippet icon()}
			<Mountains weight="bold" />
		{/snippet}
	</StatCard>

	<StatCard
		value={formatDuration(stats?.totalDuration ?? 0)}
		label="Time Active"
		delay={50}
		equivalent={`💍 ${formatLotRMarathons(stats?.totalDuration ?? 0)}`}
	>
		{#snippet icon()}
			<Timer weight="bold" />
		{/snippet}
	</StatCard>

	<StatCard
		value={formatCalories(stats?.totalCalories ?? 0)}
		label="Calories Burned"
		delay={100}
		equivalent={`🍕 ${formatPizzaSlices(stats?.totalCalories ?? 0)}`}
	>
		{#snippet icon()}
			<Fire weight="bold" />
		{/snippet}
	</StatCard>
</div>
