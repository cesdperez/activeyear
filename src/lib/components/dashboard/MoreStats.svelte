<script lang="ts">
	import { track } from '#lib/analytics/track.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { plural } from '#lib/i18n/plural.js';
	import type { Activity, SportBreakdown, Unit } from '#lib/types/index.js';
	import { weekdayLabels } from '#lib/utils/date.js';
	import {
		formatCount,
		formatDistance,
		formatDuration,
		formatShortDate
	} from '#lib/utils/format.js';
	import {
		calculateLongestBreak,
		calculateQuarterTotals,
		calculateSportAverages,
		calculateWeekdayTotals
	} from '#lib/utils/stats.js';
	import { CaretDown } from 'phosphor-svelte';
	import SectionHeading from './SectionHeading.svelte';

	let {
		activities,
		breakdown,
		unit
	}: { activities: Activity[]; breakdown: SportBreakdown[]; unit: Unit } = $props();
	let open = $state(false);
	const weekdaysLabels = $derived(weekdayLabels(i18n.locale));
	const quarters = $derived(calculateQuarterTotals(activities));
	const longestBreak = $derived(calculateLongestBreak(activities));
	const weekdays = $derived(calculateWeekdayTotals(activities));
	const averages = $derived(calculateSportAverages(breakdown));
	const busiestWeekday = $derived(weekdays.duration.indexOf(Math.max(...weekdays.duration)));

	function toggle() {
		open = !open;
		if (open) track('more_stats_opened', '');
	}
</script>

<div class="mb-24">
	<button
		type="button"
		class="btn-secondary"
		aria-expanded={open}
		aria-controls="more-stats"
		onclick={toggle}
	>
		{open ? i18n.m.dashboard.fewerStats : i18n.m.dashboard.moreStats}
		<CaretDown
			class="h-4 w-4 transition-transform duration-200 {open ? 'rotate-180' : ''}"
			weight="bold"
			aria-hidden="true"
		/>
	</button>

	<section id="more-stats" data-testid="more-stats" class="mt-10" hidden={!open}>
		{#if open}
			<SectionHeading title={i18n.m.dashboard.moreStats} />
			<div class="space-y-14">
				<div>
					<h3 class="sub-heading">{i18n.m.dashboard.quarters}</h3>
					<div class="quarters">
						{#each quarters as quarter (quarter.quarter)}
							<div class="quarter">
								<h4 class="stat-label">{i18n.m.dashboard.quarter(quarter.quarter)}</h4>
								{#if quarter.count}
									<p class="stat-value mt-1 text-3xl leading-none wrap-anywhere">
										{quarter.distance > 0
											? formatDistance(i18n.locale, quarter.distance, unit)
											: formatDuration(i18n.locale, quarter.duration)}
									</p>
									<p class="mt-2 text-sm text-[var(--color-text-muted)]">
										{formatCount(i18n.locale, quarter.count)}
										{i18n.m.common.nouns.activity(quarter.count)}, {formatDuration(
											i18n.locale,
											quarter.duration
										)}
									</p>
								{:else}
									<p class="stat-value mt-1 text-3xl leading-none text-[var(--color-text-dim)]">
										{i18n.m.dashboard.rest}
									</p>
									<p class="mt-2 text-sm text-[var(--color-text-muted)]">
										{i18n.m.dashboard.noActivities}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<div>
					<h3 class="sub-heading">{i18n.m.dashboard.longestBreak}</h3>
					{#if longestBreak}
						<p class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
							<span class="stat-value text-5xl leading-none">
								{formatCount(i18n.locale, longestBreak.days)}
								<span class="text-2xl text-[var(--color-text-muted)]"
									>{plural(i18n.locale, longestBreak.days, {
										one: i18n.m.dashboard.day,
										other: i18n.m.dashboard.days
									})}</span
								>
							</span>
							<span class="text-[var(--color-text-muted)]">
								{formatShortDate(i18n.locale, longestBreak.start)}
								{i18n.m.dashboard.to}
								{formatShortDate(i18n.locale, longestBreak.end)}
							</span>
						</p>
					{:else}
						<p class="text-[var(--color-text-muted)]">{i18n.m.dashboard.noRestDay}</p>
					{/if}
				</div>

				<div class="grid gap-14 lg:grid-cols-2 lg:gap-16">
					<div>
						<h3 class="sub-heading">{i18n.m.dashboard.byWeekday}</h3>
						<table class="stats-table">
							<thead>
								<tr
									><th scope="col">{i18n.m.dashboard.weekday}</th><th scope="col"
										>{i18n.m.dashboard.distance}</th
									><th scope="col">{i18n.m.dashboard.time}</th></tr
								>
							</thead>
							<tbody>
								{#each weekdaysLabels as day, i (day)}
									<tr class:busiest={i === busiestWeekday && weekdays.duration[i] > 0}>
										<th scope="row">{day}</th>
										<td>{formatDistance(i18n.locale, weekdays.distance[i], unit)}</td>
										<td>{formatDuration(i18n.locale, weekdays.duration[i])}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div>
						<h3 class="sub-heading">{i18n.m.dashboard.averageActivity}</h3>
						<table class="stats-table">
							<thead>
								<tr
									><th scope="col">{i18n.m.dashboard.sport}</th><th scope="col"
										>{i18n.m.dashboard.distance}</th
									><th scope="col">{i18n.m.dashboard.time}</th></tr
								>
							</thead>
							<tbody>
								{#each averages as average (average.type)}
									<tr>
										<th scope="row">{i18n.m.common.sports[average.type]}</th>
										<td
											>{average.averageDistance > 0
												? formatDistance(i18n.locale, average.averageDistance, unit)
												: ''}</td
										>
										<td>{formatDuration(i18n.locale, average.averageDuration)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>

<style>
	.sub-heading {
		margin-bottom: 1rem;
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 800;
		line-height: 1;
	}

	.quarters {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-top: 1px solid var(--color-text-dim);
		border-bottom: 1px solid var(--color-border);
	}

	.quarter {
		min-width: 0;
		padding: 1rem 1rem 1.25rem 0;
	}

	.quarter:nth-child(even) {
		padding-left: 1rem;
		border-left: 1px solid var(--color-border);
	}

	.quarter:nth-child(n + 3) {
		border-top: 1px solid var(--color-border);
	}

	@media (min-width: 1024px) {
		.quarters {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.quarter + .quarter {
			padding-left: 1.25rem;
			border-left: 1px solid var(--color-border);
		}

		.quarter:nth-child(n + 3) {
			border-top: 0;
		}
	}

	.stats-table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}

	.stats-table th,
	.stats-table td {
		padding: 0.5rem 0;
		text-align: right;
		border-bottom: 1px solid var(--color-border);
	}

	.stats-table th:first-child {
		text-align: left;
	}

	.stats-table thead th {
		padding-top: 0;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-dim);
		border-bottom-color: var(--color-text-dim);
	}

	.stats-table tbody th {
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.stats-table td {
		padding-left: 1rem;
		font-family: var(--font-stat);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-muted);
	}

	.stats-table tr.busiest td {
		color: var(--color-accent);
	}
</style>
