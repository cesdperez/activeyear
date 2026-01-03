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

	// Phosphor icons
	import {
		Ruler,
		Timer,
		Fire,
		Mountains,
		CalendarCheck,
		Lightning,
		Trophy,
		Hourglass,
		Sparkle,
		ArrowDown,
		Confetti,
		PersonSimpleRun,
		PersonSimpleBike,
		PersonSimpleSwim,
		PersonSimpleWalk,
		Barbell,
		PersonSimpleTaiChi,
		Target,
		Star,
	} from "phosphor-svelte";

	import { sportNames, sportIcons } from "$lib/constants/sports.js";
	import { consolidateBreakdown } from "$lib/utils/activity.js";

	import confetti from "canvas-confetti";

	$effect(() => {
		if (appStore.confettiEnabled) {
			const cleanup = startConfetti();
			return cleanup;
		}
	});

	function startConfetti() {
		let timeoutId: ReturnType<typeof setTimeout>;
		let active = true;

		(function frame() {
			if (!appStore.confettiEnabled || !active) return;

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

			timeoutId = setTimeout(frame, 140);
		})();

		return () => {
			active = false;
			clearTimeout(timeoutId);
		};
	}

	let breakdownMetric = $derived(appStore.breakdownMetric);

	// Consolidate small sports (less than 1 hour) into "other"
	const consolidatedBreakdownData = $derived(
		consolidateBreakdown(appStore.breakdown || []),
	);

	const sortedBreakdown = $derived(
		[...consolidatedBreakdownData].sort(
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

	const totalCount = $derived(
		sortedBreakdown.reduce((sum, s) => sum + s.count, 0),
	);

	const sportColors = ["#00d4ff", "#00ff88", "#ff6b6b", "#ffd93d", "#c084fc"];
</script>

<div
	class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative overflow-x-hidden"
>
	<div class="absolute top-4 right-4 md:right-8 z-10 flex items-center gap-2">
		<!-- Unit Toggle -->
		<div
			class="flex p-0.5 bg-[var(--color-surface-elevated)] rounded-full border border-[rgba(255,255,255,0.05)]"
		>
			<button
				class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 {appStore.unit ===
				'km'
					? 'bg-[var(--color-accent)] text-black'
					: 'text-zinc-500 hover:text-zinc-300'}"
				onclick={() => (appStore.unit = "km")}
			>
				km
			</button>
			<button
				class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 {appStore.unit ===
				'miles'
					? 'bg-[var(--color-accent)] text-black'
					: 'text-zinc-500 hover:text-zinc-300'}"
				onclick={() => (appStore.unit = "miles")}
			>
				mi
			</button>
		</div>
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
			<Confetti class="w-6 h-6" />
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
			value={formatDistance(
				appStore.stats?.totalDistance ?? 0,
				appStore.unit,
			)}
			label="Total Distance"
			delay={0}
			equivalent={`🌍 ${formatEarthLaps(appStore.stats?.totalDistance ?? 0)}`}
		>
			{#snippet icon()}
				<Ruler weight="bold" />
			{/snippet}
		</StatCard>

		<StatCard
			value={formatElevation(
				appStore.stats?.totalElevation ?? 0,
				appStore.unit,
			)}
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

	<!-- Consistency Stats -->
	<div class="grid grid-cols-2 gap-4 md:gap-6 mb-16 max-w-2xl mx-auto">
		<div
			class="stat-card p-4 md:p-6 flex items-center gap-4 group"
			style="animation-delay: 350ms"
		>
			<div class="text-[var(--color-accent)] shrink-0">
				<CalendarCheck class="w-6 h-6 md:w-8 md:h-8" weight="bold" />
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
				<Lightning class="w-6 h-6 md:w-8 md:h-8" weight="bold" />
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
					most consecutive active days
				</div>
			</div>
		</div>
	</div>

	<!-- Weekly Activity Pattern -->
	{#if appStore.weeklyPattern.some((v) => v > 0)}
		{@const maxDay = Math.max(...appStore.weeklyPattern, 1)}
		{@const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
		{@const barContainerHeight = 160}
		{@const sortedIndices = appStore.weeklyPattern
			.map((count, idx) => ({ count, idx }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 2)
			.map((item) => item.idx)}
		<section class="mb-16">
			<div class="flex items-end gap-4 mb-8">
				<h2 class="text-3xl font-bold tracking-tight">
					When You Train
				</h2>
				<div
					class="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20 mb-2"
				></div>
			</div>

			<div
				class="flex items-end justify-between gap-4 px-4"
				style="height: {barContainerHeight + 60}px;"
			>
				{#each appStore.weeklyPattern as count, i}
					{@const heightPercent = (count / maxDay) * 100}
					{@const barHeight = Math.max(
						(heightPercent / 100) * barContainerHeight,
						8,
					)}
					{@const isTopDay = sortedIndices.includes(i)}
					<div
						class="flex-1 flex flex-col items-center justify-end gap-3"
					>
						<span
							class="text-sm font-mono text-[var(--color-text-muted)]"
						>
							{count}
						</span>
						<div
							class="w-full rounded-t-xl transition-all duration-500 ease-out"
							style="height: {barHeight}px; background: linear-gradient(to top, {isTopDay
								? '#00ff88'
								: 'var(--color-accent)'}, {isTopDay
								? '#00ff8840'
								: 'var(--color-accent)40'}); box-shadow: 0 0 20px {isTopDay
								? '#00ff8830'
								: 'var(--color-accent-glow)'};"
							style:animation-delay="{i * 50}ms"
						></div>
						<span
							class="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider"
						>
							{dayLabels[i]}
						</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Favorite Activities Section -->
	<section class="mb-16">
		<div class="flex items-end gap-4 mb-8">
			<h2 class="text-3xl font-bold tracking-tight">Highlights</h2>
			<div
				class="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20 mb-2"
			></div>
		</div>

		{#if appStore.highlights.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each appStore.highlights as fav, i}
					{@const IconComponent = sportIcons[fav.type] ?? Target}
					<div
						class="stat-card p-4 flex items-center gap-4 group"
						style="animation-delay: {450 + i * 50}ms"
					>
						<div
							class="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] shrink-0"
						>
							<IconComponent class="w-6 h-6" weight="bold" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<Star
									class="w-4 h-4 text-yellow-500"
									weight="fill"
								/>
								<span
									class="font-bold text-white truncate"
									title={fav.title}
								>
									{fav.title ||
										sportNames[fav.type] ||
										"Activity"}
								</span>
							</div>
							<div
								class="flex items-center gap-3 text-sm text-[var(--color-text-muted)]"
							>
								{#if fav.distance > 0}
									<span class="font-mono"
										>{formatDistance(
											fav.distance,
											appStore.unit,
										)}</span
									>
								{/if}
								<span class="font-mono"
									>{formatDuration(fav.duration)}</span
								>
								<span
									class="px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] text-xs uppercase tracking-wider"
								>
									{sportNames[fav.type] ?? fav.type}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="stat-card p-8 flex flex-col items-center justify-center text-center"
				style="animation-delay: 450ms"
			>
				<div
					class="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-accent)]/10 mb-6"
				>
					<Star class="w-10 h-10 text-yellow-500" weight="fill" />
				</div>
				<p class="text-lg text-[var(--color-text-muted)] mb-4">
					No highlights yet
				</p>
				<p class="text-sm text-[var(--color-text-muted)] max-w-md">
					Mark activities as favorites in Garmin Connect by tapping
					the star icon on any activity, then re-export your data to
					see them here.
				</p>
			</div>
		{/if}
	</section>

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
						value={formatDuration(
							appStore.records.longestDuration.value,
						)}
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
						value={formatCalories(
							appStore.records.biggestBurn.value,
						)}
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

			<div
				class="flex flex-col lg:flex-row items-center lg:items-start gap-12"
			>
				<!-- Left: Donut Chart -->
				<div class="shrink-0 relative">
					<div
						class="donut-chart-container !w-[280px] !h-[280px] md:!w-[340px] md:!h-[340px]"
					>
						{#if true}
							{@const circumference = 2 * Math.PI * 80}
							<svg viewBox="0 0 200 200" class="donut-chart">
								<circle
									cx="100"
									cy="100"
									r="80"
									fill="none"
									stroke="rgba(255,255,255,0.05)"
									stroke-width="28"
								/>
								{#each sortedBreakdown as sport, i}
									{@const percentage =
										sport.count / totalCount}
									{@const offset = sortedBreakdown
										.slice(0, i)
										.reduce(
											(sum, s) =>
												sum +
												(s.count / totalCount) *
													circumference,
											0,
										)}
									<circle
										cx="100"
										cy="100"
										r="80"
										fill="none"
										stroke={sportColors[
											i % sportColors.length
										]}
										stroke-width="28"
										stroke-dasharray="{percentage *
											circumference -
											2} {circumference}"
										stroke-dashoffset={-offset}
										stroke-linecap="round"
										transform="rotate(-90 100 100)"
										class="donut-segment"
										style="filter: drop-shadow(0 0 8px {sportColors[
											i % sportColors.length
										]}40);"
									/>
								{/each}
							</svg>
						{/if}
						<div class="donut-center">
							<div
								class="text-4xl md:text-5xl font-black text-white leading-none"
							>
								{totalCount}
							</div>
							<div
								class="text-xs md:text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-1"
							>
								Activities
							</div>
						</div>
					</div>
				</div>

				<!-- Right: Sport Bars -->
				<div class="flex-1 space-y-6 w-full max-w-2xl">
					{#each sortedBreakdown as sport, i (sport.type)}
						{@const IconComponent =
							sportIcons[sport.type] ?? Target}
						{@const value = sport[breakdownMetric]}
						{@const percentage = (value / maxMetricValue) * 100}
						{@const color = sportColors[i % sportColors.length]}

						<div
							class="flex flex-col gap-2 group"
							style="animation: fadeInUp 0.4s ease-out forwards; animation-delay: {600 +
								i * 50}ms"
						>
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-3">
									<div
										class="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
										style="background: {color}20; color: {color};"
									>
										<IconComponent
											class="w-5 h-5"
											weight="bold"
										/>
									</div>
									<span
										class="font-bold text-white uppercase tracking-wide"
									>
										{sportNames[sport.type] ?? sport.type}
									</span>
								</div>
								<div class="text-right">
									<span
										class="font-mono font-bold text-[var(--color-accent)]"
									>
										{breakdownMetric === "count"
											? value
											: formatDuration(value)}
									</span>
								</div>
							</div>

							<div
								class="h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden"
							>
								<div
									class="h-full rounded-full transition-all duration-1000 ease-out"
									style="width: {percentage}%; background: {color}; box-shadow: 0 0 10px {color}40;"
								></div>
							</div>
						</div>
					{/each}
				</div>
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

	/* Donut Chart */
	.donut-chart-container {
		position: relative;
	}

	.donut-chart {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.donut-segment {
		transition: stroke-dasharray 0.3s ease;
	}

	.donut-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}
</style>
