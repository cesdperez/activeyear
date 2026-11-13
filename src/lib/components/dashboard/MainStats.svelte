<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
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
			value: formatDistance(i18n.locale, stats?.totalDistance ?? 0, unit),
			label: i18n.m.dashboard.totalDistance,
			delay: 0,
			equivalent: `🌍 ${formatEarthLaps(i18n.locale, stats?.totalDistance ?? 0)}`
		},
		{
			Icon: Mountains,
			value: formatElevation(i18n.locale, stats?.totalElevation ?? 0, unit),
			label: i18n.m.dashboard.elevationGained,
			delay: 150,
			equivalent: `🏔️ ${formatEverests(i18n.locale, stats?.totalElevation ?? 0)}`
		},
		{
			Icon: Timer,
			value: formatDuration(i18n.locale, stats?.totalDuration ?? 0),
			label: i18n.m.dashboard.timeActive,
			delay: 50,
			equivalent: `💍 ${formatLotRMarathons(i18n.locale, stats?.totalDuration ?? 0)}`
		},
		{
			Icon: Fire,
			value: formatCalories(i18n.locale, stats?.totalCalories ?? 0),
			label: i18n.m.dashboard.caloriesBurned,
			delay: 100,
			equivalent: `🍕 ${formatPizzaSlices(i18n.locale, stats?.totalCalories ?? 0)}`
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
