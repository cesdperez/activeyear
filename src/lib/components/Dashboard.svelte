<script lang="ts">
	import { appStore } from "$lib/stores/app.svelte.js";
	import StatCard from "./StatCard.svelte";
	import PersonalRecordCard from "./PersonalRecordCard.svelte";
	import ExportPanel from "./ExportPanel.svelte";
	import {
		formatDistance,
		formatDuration,
		formatCalories,
		formatElevation,
		formatEarthLaps,
		formatEverests,
		formatPizzaSlices,
		formatLotRMarathons,
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

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
	<!-- Header -->
	<header class="text-center mb-16 md:mb-24">
		<h1
			class="text-5xl md:text-7xl font-bold mb-6 glow-text tracking-tight"
		>
			Your 2025
		</h1>
		<div
			class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-surface-elevated)] border border-[rgba(255,255,255,0.05)]"
		>
			<span class="text-[var(--color-accent)] font-mono font-bold"
				>{appStore.stats?.activityCount}</span
			>
			<span class="text-[var(--color-text-muted)]">activities across</span
			>
			<span class="text-[var(--color-accent)] font-mono font-bold"
				>{appStore.stats?.activeDays}</span
			>
			<span class="text-[var(--color-text-muted)]">active days</span>
		</div>
	</header>

	<!-- Main Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<StatCard
			value={formatDistance(appStore.stats?.totalDistance ?? 0)}
			label="Total Distance"
			delay={0}
			equivalent={`🌍 ${formatEarthLaps(appStore.stats?.totalDistance ?? 0)}`}
		>
			{#snippet icon()}
				<Ruler />
			{/snippet}
		</StatCard>

		<StatCard
			value={formatElevation(appStore.stats?.totalElevation ?? 0)}
			label="Elevation Gained"
			delay={150}
			equivalent={`🏔️ ${formatEverests(appStore.stats?.totalElevation ?? 0)}`}
		>
			{#snippet icon()}
				<Mountain />
			{/snippet}
		</StatCard>

		<StatCard
			value={formatDuration(appStore.stats?.totalDuration ?? 0)}
			label="Time Active"
			delay={50}
			equivalent={`💍 ${formatLotRMarathons(appStore.stats?.totalDuration ?? 0)}`}
		>
			{#snippet icon()}
				<Timer />
			{/snippet}
		</StatCard>

		<StatCard
			value={formatCalories(appStore.stats?.totalCalories ?? 0)}
			label="Calories Burned"
			delay={100}
			equivalent={`🍕 ${formatPizzaSlices(appStore.stats?.totalCalories ?? 0)}`}
		>
			{#snippet icon()}
				<Flame />
			{/snippet}
		</StatCard>
	</div>

	<!-- Consistency Stats -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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
	</div>

	<!-- Personal Records Section -->
	{#if appStore.records}
		<section class="mb-16">
			<div class="flex items-end gap-4 mb-8">
				<h2 class="text-3xl font-bold tracking-tight">
					Personal Records
				</h2>
				<div
					class="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20 mb-2"
				></div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#if appStore.records.longestDistance}
					<PersonalRecordCard
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
					</PersonalRecordCard>
				{/if}
				{#if appStore.records.longestDuration}
					<PersonalRecordCard
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
					</PersonalRecordCard>
				{/if}
				{#if appStore.records.biggestBurn}
					<PersonalRecordCard
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
					</PersonalRecordCard>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Sport Breakdown -->
	{#if appStore.breakdown.length > 0}
		<section>
			<div class="flex items-end gap-4 mb-8">
				<h2 class="text-3xl font-bold tracking-tight">By Sport</h2>
				<div
					class="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20 mb-2"
				></div>
			</div>

			<div
				class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
			>
				{#each appStore.breakdown as sport, i}
					{@const IconComponent = sportIcons[sport.type] ?? Target}
					<div
						class="stat-card p-5 sport-card group hover:bg-[var(--color-surface-hover)] transition-colors duration-300"
						style="animation-delay: {600 + i * 50}ms"
					>
						<div
							class="icon-container mb-3 text-[var(--color-accent)] group-hover:scale-110 transition-transform duration-300 origin-left"
						>
							<IconComponent class="w-6 h-6" strokeWidth={1.5} />
						</div>
						<div class="text-lg font-bold text-white mb-1">
							{sportNames[sport.type] ?? sport.type}
						</div>
						<div
							class="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2"
						>
							{sport.count}
							{sport.count === 1 ? "activity" : "activities"}
						</div>
						{#if sport.distance > 0}
							<div
								class="text-sm font-mono text-[var(--color-text-dim)] group-hover:text-[var(--color-text-primary)] transition-colors"
							>
								{formatDistance(sport.distance)}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Export Panel -->
	<ExportPanel />

	<!-- Upload New File -->
	<div class="mt-24 text-center">
		<button
			class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-[var(--color-surface-elevated)] transition-all duration-300 group"
			onclick={() => appStore.reset()}
		>
			<span
				class="group-hover:-rotate-180 transition-transform duration-500"
				>↺</span
			>
			Upload different file
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
