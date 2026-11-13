<script lang="ts">
	import type { SummaryMetric, Unit, YearStats } from '#lib/types/index.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { activeDaysPercent } from '#lib/utils/breakdown.js';
	import { formatCount, formatPercentOfYear, showsValue } from '#lib/utils/format.js';
	import { scaledLength, totalStats, UNIT_SCALE } from '#lib/utils/totals.js';
	import ValueWithUnits from '../ValueWithUnits.svelte';
	import CountUp from './CountUp.svelte';

	let { stats, unit, focus }: { stats: YearStats | null; unit: Unit; focus: SummaryMetric } =
		$props();

	const totals = $derived(stats ? totalStats(i18n.locale, stats, unit) : []);
	const headline = $derived(totals.find((stat) => stat.id === focus) ?? totals[0]);
	const activeDays = $derived(stats?.activeDays ?? 0);
	const streak = $derived(stats?.longestStreak ?? 0);

	const cells = $derived([
		...totals
			.filter((stat) => stat !== headline && showsValue(stat.value))
			.map(({ label, value, funFact }) => ({ label, value, funFact })),
		{
			label: i18n.m.dashboard.activeDays,
			value: formatCount(i18n.locale, activeDays),
			funFact: i18n.m.dashboard.percentOfYear(
				formatPercentOfYear(i18n.locale, activeDaysPercent(activeDays, TARGET_YEAR))
			)
		},
		{
			label: i18n.m.dashboard.longestStreakDays,
			value: formatCount(i18n.locale, streak),
			funFact: ''
		}
	]);
	const fitChars = $derived(
		Math.max(...cells.map((cell) => scaledLength(cell.value, UNIT_SCALE.board)))
	);
</script>

{#if headline}
	<section data-testid="main-stats" aria-labelledby="totals-heading" class="mb-20 md:mb-28">
		<h2 id="totals-heading" class="sr-only">{i18n.m.dashboard.totals}</h2>
		<div class="@container mx-auto max-w-4xl text-center">
			<p class="stat-label text-base">{headline.label}</p>
			<p
				data-testid="headline-value"
				class="headline stat-value fit-value hero-glow mt-2 leading-[0.9] text-[var(--color-text-primary)]"
				style:--fit-chars={scaledLength(headline.value, UNIT_SCALE.dashboardHeadline)}
				style:--fit-max="11rem"
			>
				<CountUp total={headline.total} value={headline.value} format={headline.format} />
			</p>
			<p class="fun-fact mt-4 justify-center">{headline.funFact}</p>
		</div>

		<dl class="board mt-12 md:mt-16" style:--cells={cells.length}>
			{#each cells as { label, value, funFact } (label)}
				<div class="cell">
					<dt class="stat-label">{label}</dt>
					<dd class="@container min-w-0">
						<span
							data-testid="board-value"
							class="stat-value fit-value block leading-none text-[var(--color-text-primary)]"
							style:--fit-chars={fitChars}
							style:--fit-max="3.25rem"
							><ValueWithUnits {value} unitScale={UNIT_SCALE.board} /></span
						>
					</dd>
					{#if funFact}<dd class="fun-fact">{funFact}</dd>{/if}
				</div>
			{/each}
		</dl>
	</section>
{/if}

<style>
	.headline {
		font-weight: 900;
		letter-spacing: -0.01em;
	}

	/* Grid columns differ by a fraction of a pixel, so whole pixels keep the row on one size. */
	.board .fit-value {
		font-size: round(down, min(var(--fit-max), 100cqi / (var(--fit-chars) * 0.65)), 1px);
	}

	.board {
		border-top: 1px solid var(--color-text-dim);
		border-bottom: 1px solid var(--color-border);
	}

	/* A results sheet on phones: one row per stat, value against the right edge. */
	.cell {
		display: grid;
		grid-template-columns: 1fr minmax(0, 9rem);
		grid-template-areas: 'label value' 'fact fact';
		align-items: baseline;
		column-gap: 1rem;
		padding: 0.875rem 0;
	}

	.cell + .cell {
		border-top: 1px solid var(--color-border);
	}

	.cell dt {
		grid-area: label;
	}

	.cell dd:first-of-type {
		grid-area: value;
		text-align: right;
	}

	.cell .fun-fact {
		grid-area: fact;
		margin-top: 0.25rem;
	}

	@media (min-width: 768px) {
		.board {
			display: grid;
			grid-template-columns: repeat(var(--cells), minmax(0, 1fr));
		}

		.cell {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			gap: 0.375rem;
			padding: 1.25rem 1.25rem 1.5rem;
		}

		/* Every cell has the border, so the rule cannot make one narrower than the rest. */
		.cell {
			border-left: 1px solid transparent;
		}

		.cell + .cell {
			border-top: 0;
			border-left-color: var(--color-border);
		}

		.cell dd:first-of-type {
			order: -1;
			text-align: left;
		}
	}
</style>
