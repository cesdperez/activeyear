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

	const cards = $derived([
		{
			Icon: Ruler,
			value: formatDistance(stats?.totalDistance ?? 0, unit),
			label: 'Total Distance',
			delay: 0,
			equivalent: `🌍 ${formatEarthLaps(stats?.totalDistance ?? 0)}`
		},
		{
			Icon: Mountains,
			value: formatElevation(stats?.totalElevation ?? 0, unit),
			label: 'Elevation Gained',
			delay: 150,
			equivalent: `🏔️ ${formatEverests(stats?.totalElevation ?? 0)}`
		},
		{
			Icon: Timer,
			value: formatDuration(stats?.totalDuration ?? 0),
			label: 'Time Active',
			delay: 50,
			equivalent: `💍 ${formatLotRMarathons(stats?.totalDuration ?? 0)}`
		},
		{
			Icon: Fire,
			value: formatCalories(stats?.totalCalories ?? 0),
			label: 'Calories Burned',
			delay: 100,
			equivalent: `🍕 ${formatPizzaSlices(stats?.totalCalories ?? 0)}`
		}
	]);

	const fitChars = $derived(Math.max(...cards.map((card) => card.value.length)));
</script>

<div data-testid="main-stats" class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
	{#each cards as { Icon, value, label, delay, equivalent } (label)}
		<StatCard {value} {label} {delay} {equivalent} {fitChars}>
			{#snippet icon()}
				<Icon weight="bold" aria-hidden="true" />
			{/snippet}
		</StatCard>
	{/each}
</div>
