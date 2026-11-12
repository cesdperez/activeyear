<script lang="ts">
	import type { Activity, SportBreakdown, Unit } from '#lib/types/index.js';
	import { sportNames } from '#lib/constants/sports.js';
	import { WEEKDAY_LABELS } from '#lib/constants/time.js';
	import {
		formatCount,
		formatDistance,
		formatDuration,
		formatShortDate,
		pluralize
	} from '#lib/utils/format.js';
	import {
		calculateLongestBreak,
		calculateQuarterTotals,
		calculateSportAverages,
		calculateWeekdayTotals
	} from '#lib/utils/stats.js';
	import SectionHeading from './SectionHeading.svelte';

	let {
		activities,
		breakdown,
		unit
	}: { activities: Activity[]; breakdown: SportBreakdown[]; unit: Unit } = $props();
	let open = $state(false);
	const quarters = $derived(calculateQuarterTotals(activities));
	const longestBreak = $derived(calculateLongestBreak(activities));
	const weekdays = $derived(calculateWeekdayTotals(activities));
	const averages = $derived(calculateSportAverages(breakdown));
</script>

<div class="my-12">
	<button
		type="button"
		class="rounded-lg border border-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
		aria-expanded={open}
		aria-controls="more-stats"
		onclick={() => (open = !open)}
	>
		{open ? 'Fewer stats' : 'More stats'}
	</button>

	<section id="more-stats" data-testid="more-stats" class="mt-8" hidden={!open}>
		{#if open}
			<SectionHeading title="More Stats" />
			<div class="space-y-10">
				<div>
					<h3 class="mb-4 text-xl font-bold">Quarters</h3>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{#each quarters as quarter (quarter.quarter)}
							<div class="stat-card min-w-0 p-4">
								<h4
									class="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
								>
									Q{quarter.quarter}
								</h4>
								{#if quarter.count}
									<p class="mt-2 text-xl font-bold break-words text-[var(--color-accent)]">
										{quarter.distance > 0
											? formatDistance(quarter.distance, unit)
											: formatDuration(quarter.duration)}
									</p>
									<p class="text-sm text-[var(--color-text-muted)]">
										{formatCount(quarter.count)}
										{pluralize(quarter.count, 'activity', 'activities')} · {formatDuration(
											quarter.duration
										)}
									</p>
								{:else}
									<p class="mt-2 text-xl font-bold">Rest</p>
									<p class="text-sm text-[var(--color-text-muted)]">No activities</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
				<div>
					<h3 class="mb-4 text-xl font-bold">Longest break</h3>
					{#if longestBreak}
						<p class="text-2xl font-bold text-[var(--color-accent)]">
							{formatCount(longestBreak.days)}
							{pluralize(longestBreak.days, 'day', 'days')}
						</p>
						<p class="text-sm text-[var(--color-text-muted)]">
							{formatShortDate(longestBreak.start)} to {formatShortDate(longestBreak.end)}
						</p>
					{:else}
						<p class="text-[var(--color-text-muted)]">No rest day between activities.</p>
					{/if}
				</div>
				<div>
					<h3 class="mb-4 text-xl font-bold">By weekday</h3>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
						{#each WEEKDAY_LABELS as day, i (day)}
							<div class="stat-card min-w-0 p-4">
								<h4
									class="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
								>
									{day}
								</h4>
								<p class="text-xl font-bold break-words text-[var(--color-accent)]">
									{formatDistance(weekdays.distance[i], unit)}
								</p>
								<p class="text-sm break-words text-[var(--color-text-muted)]">
									{formatDuration(weekdays.duration[i])}
								</p>
							</div>
						{/each}
					</div>
				</div>
				<div>
					<h3 class="mb-4 text-xl font-bold">Average per activity</h3>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
						{#each averages as average (average.type)}
							<div class="stat-card min-w-0 p-4">
								<h4
									class="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
								>
									{sportNames[average.type]}
								</h4>
								{#if average.averageDistance > 0}
									<p class="text-xl font-bold break-words text-[var(--color-accent)]">
										{formatDistance(average.averageDistance, unit)}
									</p>
								{/if}
								<p
									class={average.averageDistance > 0
										? 'text-sm break-words text-[var(--color-text-muted)]'
										: 'text-xl font-bold break-words text-[var(--color-accent)]'}
								>
									{formatDuration(average.averageDuration)}
								</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>
