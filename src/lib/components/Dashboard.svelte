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

	// Lucide icons (for non-sport UI elements)
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
		ArrowDown,
	} from "@lucide/svelte";

	// Phosphor icons for sports (bold, activity-true icons)
	import {
		PersonSimpleRun,
		PersonSimpleBike,
		PersonSimpleSwim,
		PersonSimpleWalk,
		Mountains,
		Barbell,
		Flower,
		Target,
	} from "phosphor-svelte";

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

	// Sport icons mapping (using Phosphor for bold, activity-specific icons)
	const sportIcons: Record<string, typeof PersonSimpleRun> = {
		running: PersonSimpleRun,
		cycling: PersonSimpleBike,
		swimming: PersonSimpleSwim,
		walking: PersonSimpleWalk,
		hiking: Mountains,
		strength: Barbell,
		yoga: Flower,
		other: Target,
	};

	import confetti from "canvas-confetti";
	import { PartyPopper } from "@lucide/svelte";

	$effect(() => {
		if (appStore.confettiEnabled) {
			startConfetti();
		}
	});

	function startConfetti() {
		(function frame() {
			if (!appStore.confettiEnabled) return;

			confetti({
				particleCount: 1,
				startVelocity: 0,
				ticks: 800,
				gravity: 0.3,
				scalar: 0.7,
				origin: {
					x: Math.random(),
					// since they fall down, start a bit above the screen
					y: -0.1,
				},
				colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
				shapes: ["circle", "square"],
				disableForReducedMotion: true,
			});

			setTimeout(frame, 140);
		})();
	}

	let breakdownMetric = $derived(appStore.breakdownMetric);
	const sortedBreakdown = $derived(
		[...(appStore.breakdown || [])].sort(
			(a, b) => b[breakdownMetric] - a[breakdownMetric],
		),
	);
	const maxMetricValue = $derived(
		Math.max(
			...sortedBreakdown.map(
				(s: (typeof sortedBreakdown)[0]) => s[breakdownMetric],
			),
			1,
		),
	);
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
	<div class="absolute top-4 right-4 md:right-8 z-10">
		<button
			class="p-2 rounded-full transition-all duration-300 hover:scale-110 {appStore.confettiEnabled
				? 'bg-[var(--color-surface-elevated)] text-[var(--color-accent)] shadow-lg'
				: 'bg-transparent text-zinc-600 hover:text-zinc-400'}"
			onclick={() =>
				(appStore.confettiEnabled = !appStore.confettiEnabled)}
			title={appStore.confettiEnabled
				? "Disable celebration mode"
				: "Enable celebration mode"}
			aria-label="Toggle celebration confetti"
		>
			<PartyPopper class="w-6 h-6" />
		</button>
	</div>
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

		<div class="mt-8">
			<button
				class="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-white transition-colors duration-200 group"
				onclick={() => {
					document
						.getElementById("export-panel")
						?.scrollIntoView({ behavior: "smooth" });
				}}
			>
				<span>Jump to Export</span>
				<ArrowDown
					class="w-4 h-4 group-hover:translate-y-1 transition-transform"
				/>
			</button>
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
	<div class="grid grid-cols-2 gap-4 md:gap-6 mb-16 max-w-2xl mx-auto">
		<div
			class="stat-card p-4 md:p-6 flex items-center gap-4 group"
			style="animation-delay: 350ms"
		>
			<div class="text-[var(--color-accent)] shrink-0">
				<CalendarCheck class="w-6 h-6 md:w-8 md:h-8" />
			</div>
			<div>
				<div
					class="text-2xl md:text-3xl font-bold text-white leading-none"
				>
					{appStore.stats?.activeDays ?? 0}
				</div>
				<div
					class="text-xs md:text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wider"
				>
					Active Days
				</div>
			</div>
		</div>

		<div
			class="stat-card p-4 md:p-6 flex items-center gap-4 group"
			style="animation-delay: 400ms"
		>
			<div class="text-[var(--color-accent)] shrink-0">
				<Zap class="w-6 h-6 md:w-8 md:h-8" />
			</div>
			<div>
				<div
					class="text-2xl md:text-3xl font-bold text-white leading-none"
				>
					{appStore.stats?.longestStreak ?? 0}
				</div>
				<div
					class="text-xs md:text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wider"
				>
					Best Day Streak
				</div>
			</div>
		</div>
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
							<Flame />
						{/snippet}
					</PersonalRecordCard>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Sport Breakdown -->
	{#if appStore.breakdown.length > 0}
		<section>
			<div
				class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
			>
				<div class="flex items-end gap-4 flex-1">
					<h2 class="text-3xl font-bold tracking-tight">By Sport</h2>
					<div
						class="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20 mb-2"
					></div>
				</div>

				<div
					class="flex p-1 bg-[var(--color-surface-elevated)] rounded-lg self-start"
				>
					<button
						class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 {breakdownMetric ===
						'count'
							? 'bg-[var(--color-accent)] text-black'
							: 'text-zinc-500 hover:text-zinc-300'}"
						onclick={() => (appStore.breakdownMetric = "count")}
					>
						Activities
					</button>
					<button
						class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 {breakdownMetric ===
						'duration'
							? 'bg-[var(--color-accent)] text-black'
							: 'text-zinc-500 hover:text-zinc-300'}"
						onclick={() => (appStore.breakdownMetric = "duration")}
					>
						Time
					</button>
				</div>
			</div>

			<div class="space-y-4 max-w-4xl">
				{#each sortedBreakdown as sport, i (sport.type)}
					{@const IconComponent = sportIcons[sport.type] ?? Target}
					{@const value = sport[breakdownMetric]}
					{@const percentage = (value / maxMetricValue) * 100}
					<div
						class="flex items-center gap-4 group"
						style="animation: fadeInUp 0.4s ease-out forwards; animation-delay: {600 +
							i * 50}ms"
					>
						<div
							class="w-10 h-10 rounded-lg bg-[var(--color-surface-elevated)] flex items-center justify-center text-[var(--color-accent)] group-hover:scale-110 transition-transform"
						>
							<IconComponent class="w-5 h-5" weight="bold" />
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-end mb-1">
								<span class="font-bold text-white truncate">
									{sportNames[sport.type] ?? sport.type}
								</span>
								<span
									class="font-mono text-sm text-[var(--color-accent)]"
								>
									{breakdownMetric === "count"
										? value
										: formatDuration(value)}
								</span>
							</div>

							<div
								class="h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden"
							>
								<div
									class="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dim,var(--color-accent))] rounded-full transition-all duration-500 ease-out"
									style="width: {percentage}%"
								></div>
							</div>
						</div>
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
