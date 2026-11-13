<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { activeDaysPercent } from '#lib/utils/breakdown.js';
	import { formatCount, formatPercentOfYear } from '#lib/utils/format.js';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';

	let {
		activeDays,
		longestStreak,
		yearSoFar,
		daysCounted
	}: { activeDays: number; longestStreak: number; yearSoFar: boolean; daysCounted: number } =
		$props();

	const cells = $derived([
		{
			value: formatCount(i18n.locale, activeDays),
			label: i18n.m.dashboard.activeDaysLabel(activeDays),
			fact: (yearSoFar ? i18n.m.dashboard.percentOfYearSoFar : i18n.m.dashboard.percentOfYear)(
				formatPercentOfYear(i18n.locale, activeDaysPercent(activeDays, daysCounted))
			)
		},
		{
			value: formatCount(i18n.locale, longestStreak),
			label: i18n.m.dashboard.dayStreak,
			fact: i18n.m.export.withoutRestDay
		}
	]);
</script>

<section class="mb-[36px]">
	<SectionHeading title={i18n.m.export.consistency} variant="export" />
	<div class="grid grid-cols-2">
		{#each cells as { value, label, fact }, i (label)}
			<div class="cell" class:ruled={i > 0}>
				<p
					class="stat-value leading-none text-[var(--color-text-primary)]"
					style:font-size="calc(96px * var(--stat-scale))"
				>
					{value}
				</p>
				<p class="card-label mt-3 text-[var(--color-text-muted)]">{label}</p>
				<p class="fun-fact mt-1">{fact}</p>
			</div>
		{/each}
	</div>
</section>

<style>
	.cell {
		padding: 20px 0 24px;
		border-top: var(--panel-border-width) solid var(--color-border);
		border-bottom: var(--panel-border-width) solid var(--color-border);
	}

	.ruled {
		padding-left: 32px;
		border-left: var(--panel-border-width) solid var(--color-border);
	}
</style>
