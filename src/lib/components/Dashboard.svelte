<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import ExportPanel from "./ExportPanel.svelte";
	import ConfettiRain from "#lib/components/dashboard/ConfettiRain.svelte";
	import DashboardToolbar from "#lib/components/dashboard/DashboardToolbar.svelte";
	import DashboardHeader from "#lib/components/dashboard/DashboardHeader.svelte";
	import MainStats from "#lib/components/dashboard/MainStats.svelte";
	import ConsistencyStats from "#lib/components/dashboard/ConsistencyStats.svelte";
	import WeeklyPattern from "#lib/components/dashboard/WeeklyPattern.svelte";
	import HighlightsSection from "#lib/components/dashboard/HighlightsSection.svelte";
	import PersonalRecords from "#lib/components/dashboard/PersonalRecords.svelte";
	import {
		formatDistance,
		formatDuration,
		formatCalories,
	} from "#lib/utils/format.js";

	// Phosphor icons
	import {
		Fire,
		Trophy,
		Hourglass,
		Target,
		Star,
	} from "phosphor-svelte";

	import {
		sportNames,
		sportIcons,
		sportColors,
	} from "#lib/constants/sports.js";
	import { consolidateBreakdown } from "#lib/utils/activity.js";

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

	const circumference = 2 * Math.PI * 80;
</script>

<div
	class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative overflow-x-hidden"
>
	<ConfettiRain />
	<DashboardToolbar />
	<DashboardHeader />
	<MainStats />
	<ConsistencyStats />

	<WeeklyPattern />

	<HighlightsSection />
	<PersonalRecords />

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
								{@const percentage = sport.count / totalCount}
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
									stroke={sportColors[i % sportColors.length]}
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
