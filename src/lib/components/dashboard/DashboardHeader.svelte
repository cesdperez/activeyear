<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { formatCount } from '#lib/utils/format.js';
	import { skippedRowsNotice } from '#lib/utils/uploadErrors.js';
	import { prefersReducedMotion } from 'svelte/motion';
	import { ArrowDown, Warning } from 'phosphor-svelte';
	import Logotype from '#lib/components/Logotype.svelte';

	let {
		activityCount,
		activeDays,
		skippedRowCount,
		yearSoFar
	}: { activityCount: number; activeDays: number; skippedRowCount: number; yearSoFar: boolean } =
		$props();

	function jumpToExport() {
		const heading = document.querySelector<HTMLElement>('#export-panel h2');
		if (!heading) return;
		heading.tabIndex = -1;
		heading.scrollIntoView({ behavior: prefersReducedMotion.current ? 'auto' : 'smooth' });
		heading.focus({ preventScroll: true });
	}
</script>

{#snippet summaryPhrase(phrase: string, count: string)}
	{@const [before, after] = phrase.split(count)}
	<span class="whitespace-nowrap">{before}<span class="count">{count}</span>{after}</span>
{/snippet}

<header class="mt-12 mb-12 text-center md:mt-8 md:mb-14">
	<Logotype class="mb-8 text-[1.75rem]" />
	<h1
		class="display-heading mb-5 text-[clamp(3.5rem,13vw,7rem)] font-black"
		tabindex="-1"
		{@attach (heading) => heading.focus()}
	>
		{(yearSoFar ? i18n.m.dashboard.yourYearSoFar : i18n.m.dashboard.yourYear)(TARGET_YEAR)}
	</h1>
	<p data-testid="activity-summary" class="text-lg text-[var(--color-text-muted)]">
		{@render summaryPhrase(
			i18n.m.dashboard.activitySummaryActivities(
				formatCount(i18n.locale, activityCount),
				activityCount
			),
			formatCount(i18n.locale, activityCount)
		)}
		{@render summaryPhrase(
			i18n.m.dashboard.activitySummaryDays(formatCount(i18n.locale, activeDays), activeDays),
			formatCount(i18n.locale, activeDays)
		)}
	</p>
	{#if skippedRowCount > 0}
		<p class="mt-3 flex items-center justify-center gap-1.5 text-sm text-[var(--color-text-muted)]">
			<Warning class="h-4 w-4 shrink-0" weight="bold" aria-hidden="true" />
			{skippedRowsNotice(skippedRowCount, i18n.locale)}
		</p>
	{/if}

	<button
		class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
		onclick={jumpToExport}
	>
		{i18n.m.dashboard.jumpExport}
		<ArrowDown class="h-4 w-4" weight="bold" aria-hidden="true" />
	</button>
</header>

<style>
	.count {
		font-family: var(--font-display);
		font-size: 1.625rem;
		font-weight: 800;
		line-height: 1;
		color: var(--color-accent);
		font-variant-numeric: tabular-nums;
	}
</style>
