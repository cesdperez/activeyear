<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { plural } from '#lib/i18n/plural.js';
	import type { Activity, SportBreakdown, Unit } from '#lib/types/index.js';
	import { INTL_LOCALES } from '#lib/constants/locales.js';
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
	import SectionHeading from './SectionHeading.svelte';

	let {
		activities,
		breakdown,
		unit
	}: { activities: Activity[]; breakdown: SportBreakdown[]; unit: Unit } = $props();
	let open = $state(false);
	const weekdaysLabels = $derived.by(() => {
		const formatter = new Intl.DateTimeFormat(INTL_LOCALES[i18n.locale], {
			weekday: 'short',
			timeZone: 'UTC'
		});
		return Array.from({ length: 7 }, (_, i) =>
			formatter.format(new Date(Date.UTC(2024, 0, i + 1)))
		);
	});
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
		{open ? i18n.m.dashboard.fewerStats : i18n.m.dashboard.moreStats}
	</button>

	<section id="more-stats" data-testid="more-stats" class="mt-8" hidden={!open}>
		{#if open}
			<SectionHeading title={i18n.m.dashboard.moreStatsTitle} />
			<div class="space-y-10">
				<div>
					<h3 class="mb-4 text-xl font-bold">{i18n.m.dashboard.quarters}</h3>
					<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
											? formatDistance(i18n.locale, quarter.distance, unit)
											: formatDuration(i18n.locale, quarter.duration)}
									</p>
									<p class="text-sm text-[var(--color-text-muted)]">
										{formatCount(i18n.locale, quarter.count)}
										{i18n.m.common.nouns.activity(quarter.count)} · {formatDuration(
											i18n.locale,
											quarter.duration
										)}
									</p>
								{:else}
									<p class="mt-2 text-xl font-bold">{i18n.m.dashboard.rest}</p>
									<p class="text-sm text-[var(--color-text-muted)]">
										{i18n.m.dashboard.noActivities}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
				<div>
					<h3 class="mb-4 text-xl font-bold">{i18n.m.dashboard.longestBreak}</h3>
					{#if longestBreak}
						<p class="text-2xl font-bold text-[var(--color-accent)]">
							{formatCount(i18n.locale, longestBreak.days)}
							{plural(i18n.locale, longestBreak.days, {
								one: i18n.m.dashboard.day,
								other: i18n.m.dashboard.days
							})}
						</p>
						<p class="text-sm text-[var(--color-text-muted)]">
							{formatShortDate(i18n.locale, longestBreak.start)}
							{i18n.m.dashboard.to}
							{formatShortDate(i18n.locale, longestBreak.end)}
						</p>
					{:else}
						<p class="text-[var(--color-text-muted)]">{i18n.m.dashboard.noRestDay}</p>
					{/if}
				</div>
				<div>
					<h3 class="mb-4 text-xl font-bold">{i18n.m.dashboard.byWeekday}</h3>
					<div class="stat-card divide-y divide-[var(--color-text-muted)]/20 px-4 md:hidden">
						{#each weekdaysLabels as day, i (day)}
							<div class="flex items-baseline justify-between gap-4 py-2">
								<span
									class="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
								>
									{day}
								</span>
								<span class="text-right">
									<span class="font-bold text-[var(--color-accent)]">
										{formatDistance(i18n.locale, weekdays.distance[i], unit)}
									</span>
									<span class="ml-2 text-sm text-[var(--color-text-muted)]">
										{formatDuration(i18n.locale, weekdays.duration[i])}
									</span>
								</span>
							</div>
						{/each}
					</div>
					<div class="hidden gap-3 md:grid md:grid-cols-7">
						{#each weekdaysLabels as day, i (day)}
							<div class="stat-card min-w-0 p-2 lg:p-4">
								<h4
									class="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
								>
									{day}
								</h4>
								<p class="text-base font-bold break-words text-[var(--color-accent)] lg:text-xl">
									{formatDistance(i18n.locale, weekdays.distance[i], unit)}
								</p>
								<p class="text-xs break-words text-[var(--color-text-muted)] lg:text-sm">
									{formatDuration(i18n.locale, weekdays.duration[i])}
								</p>
							</div>
						{/each}
					</div>
				</div>
				<div>
					<h3 class="mb-4 text-xl font-bold">{i18n.m.dashboard.averageActivity}</h3>
					<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
						{#each averages as average (average.type)}
							<div class="stat-card min-w-0 p-4">
								<h4
									class="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
								>
									{i18n.m.common.sports[average.type]}
								</h4>
								{#if average.averageDistance > 0}
									<p class="text-xl font-bold break-words text-[var(--color-accent)]">
										{formatDistance(i18n.locale, average.averageDistance, unit)}
									</p>
								{/if}
								<p
									class={average.averageDistance > 0
										? 'text-sm break-words text-[var(--color-text-muted)]'
										: 'text-xl font-bold break-words text-[var(--color-accent)]'}
								>
									{formatDuration(i18n.locale, average.averageDuration)}
								</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>
