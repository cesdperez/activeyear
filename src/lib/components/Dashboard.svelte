<script lang="ts">
	import { appStore } from "$lib/stores/app.svelte.js";
	import StatCard from "./StatCard.svelte";
	import {
		formatDistance,
		formatDuration,
		formatCalories,
		formatElevation,
		formatEarthLaps,
		formatEverests,
		formatPizzaSlices,
	} from "$lib/utils/format.js";

	// Lucide icons
	import {
		Ruler,
		Timer,
		Flame,
		Mountain,
		Globe,
		MountainSnow,
		Pizza,
		CalendarCheck,
		Zap,
		Trophy,
		Hourglass,
		Sparkles,
		Footprints,
		Bike,
		Waves,
		Dumbbell,
		Heart,
		Target,
	} from "@lucide/svelte";

	// Sport type display names
	const sportNames: Record<string, string> = {
		running: "Running",
		cycling: "Cycling",
		swimming: "Swimming",
		walking: "Walking",
		hiking: "Hiking",
		strength: "Strength",
		yoga: "Yoga",
		other: "Other",
	};

	// Sport icons mapping
	const sportIcons: Record<string, typeof Footprints> = {
		running: Footprints,
		cycling: Bike,
		swimming: Waves,
		walking: Footprints,
		hiking: Mountain,
		strength: Dumbbell,
		yoga: Heart,
		other: Target,
	};
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
	<!-- Header -->
	<header class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold mb-2 glow-text">Your 2025</h1>
		<p class="text-zinc-400">
			{appStore.stats?.activityCount} activities across {appStore.stats
				?.activeDays} active days
		</p>
	</header>

	<!-- Core Stats Grid -->
	<section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<StatCard
			value={formatDistance(appStore.stats?.totalDistance ?? 0)}
			label="Total Distance"
			delay={0}
		>
			{#snippet icon()}
				<Ruler />
			{/snippet}
		</StatCard>
		<StatCard
			value={formatDuration(appStore.stats?.totalDuration ?? 0)}
			label="Time Active"
			delay={50}
		>
			{#snippet icon()}
				<Timer />
			{/snippet}
		</StatCard>
		<StatCard
			value={formatCalories(appStore.stats?.totalCalories ?? 0)}
			label="Calories Burned"
			delay={100}
		>
			{#snippet icon()}
				<Flame />
			{/snippet}
		</StatCard>
		<StatCard
			value={formatElevation(appStore.stats?.totalElevation ?? 0)}
			label="Elevation Gained"
			delay={150}
		>
			{#snippet icon()}
				<Mountain />
			{/snippet}
		</StatCard>
	</section>

	<!-- Derived Metrics -->
	<section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
		<StatCard
			value={formatEarthLaps(appStore.stats?.totalDistance ?? 0)}
			label="Earth Laps"
			delay={200}
		>
			{#snippet icon()}
				<Globe />
			{/snippet}
		</StatCard>
		<StatCard
			value={formatEverests(appStore.stats?.totalElevation ?? 0)}
			label="Everests Climbed"
			delay={250}
		>
			{#snippet icon()}
				<MountainSnow />
			{/snippet}
		</StatCard>
		<StatCard
			value={formatPizzaSlices(appStore.stats?.totalCalories ?? 0)}
			label="Pizza Slices Burned"
			delay={300}
		>
			{#snippet icon()}
				<Pizza />
			{/snippet}
		</StatCard>
	</section>

	<!-- Consistency Stats -->
	<section class="grid grid-cols-2 gap-4 mb-8">
		<StatCard
			value={`${appStore.stats?.activeDays ?? 0}`}
			label="Active Days"
			detail="in 2025"
			highlight
			delay={350}
		>
			{#snippet icon()}
				<CalendarCheck />
			{/snippet}
		</StatCard>
		<StatCard
			value={`${appStore.stats?.longestStreak ?? 0}`}
			label="Longest Streak"
			detail="consecutive days"
			highlight
			delay={400}
		>
			{#snippet icon()}
				<Zap />
			{/snippet}
		</StatCard>
	</section>

	<!-- Personal Records -->
	{#if appStore.records}
		<section class="mb-8">
			<h2 class="text-xl font-semibold mb-4 text-zinc-300">
				Personal Records
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#if appStore.records.longestDistance}
					<StatCard
						value={formatDistance(
							appStore.records.longestDistance.value,
						)}
						label="Longest Distance"
						detail={appStore.records.longestDistance.activity.title}
						delay={450}
					>
						{#snippet icon()}
							<Trophy />
						{/snippet}
					</StatCard>
				{/if}
				{#if appStore.records.longestDuration}
					<StatCard
						value={formatDuration(
							appStore.records.longestDuration.value,
						)}
						label="Longest Duration"
						detail={appStore.records.longestDuration.activity.title}
						delay={500}
					>
						{#snippet icon()}
							<Hourglass />
						{/snippet}
					</StatCard>
				{/if}
				{#if appStore.records.biggestBurn}
					<StatCard
						value={formatCalories(
							appStore.records.biggestBurn.value,
						)}
						label="Biggest Burn"
						detail={appStore.records.biggestBurn.activity.title}
						delay={550}
					>
						{#snippet icon()}
							<Sparkles />
						{/snippet}
					</StatCard>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Sport Breakdown -->
	{#if appStore.breakdown.length > 0}
		<section>
			<h2 class="text-xl font-semibold mb-4 text-zinc-300">By Sport</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each appStore.breakdown as sport, i}
					{@const IconComponent = sportIcons[sport.type] ?? Target}
					<div
						class="stat-card p-4 sport-card"
						style="animation-delay: {600 + i * 50}ms"
					>
						<div class="icon-container mb-2">
							<IconComponent
								class="w-6 h-6 text-cyan-400"
								strokeWidth={1.75}
							/>
						</div>
						<div class="text-lg font-semibold text-white">
							{sportNames[sport.type] ?? sport.type}
						</div>
						<div class="text-sm text-zinc-400">
							{sport.count}
							{sport.count === 1 ? "activity" : "activities"}
						</div>
						{#if sport.distance > 0}
							<div class="text-xs text-zinc-500 mt-1">
								{formatDistance(sport.distance)}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Upload New File -->
	<div class="mt-12 text-center">
		<button
			class="text-sm text-zinc-500 hover:text-cyan-400 transition-colors"
			onclick={() => appStore.reset()}
		>
			↺ Upload different file
		</button>
	</div>
</div>

<style>
	.icon-container {
		display: flex;
		align-items: center;
	}

	.sport-card {
		opacity: 0;
		animation: fadeInUp 0.4s ease-out forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
