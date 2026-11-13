<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { showsValue } from '#lib/utils/format.js';
	import { scaledLength, totalStats, UNIT_SCALE } from '#lib/utils/totals.js';
	import { recordActivities } from '#lib/utils/yearLane.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { Target } from 'phosphor-svelte';
	import { sportIcons } from '#lib/constants/sports.js';
	import { rankSports } from '#lib/utils/breakdown.js';
	import ExportCardBase from './ExportCardBase.svelte';
	import ValueWithUnits from './ValueWithUnits.svelte';
	import YearLane from './widgets/YearLane.svelte';

	const topSport = $derived(rankSports(appStore.breakdown, appStore.breakdownMetric)[0]);
	const TopIcon = $derived(topSport ? (sportIcons[topSport.type] ?? Target) : Target);

	const totals = $derived(
		appStore.stats ? totalStats(i18n.locale, appStore.stats, appStore.unit) : []
	);
	const hero = $derived(totals.find((s) => s.id === appStore.summaryMetric) ?? totals[0]);
	const supporting = $derived(totals.filter((s) => s !== hero && showsValue(s.value)));
	const fitChars = $derived(
		Math.max(...supporting.map((s) => scaledLength(s.value, UNIT_SCALE.board)))
	);
</script>

<ExportCardBase variant="summary" title={i18n.m.export.yearInSport}>
	{#snippet headerAside()}
		<div class="avatar-container">
			{#if appStore.userPfp}
				<img
					src={appStore.userPfp}
					alt={i18n.m.export.profile}
					class="h-full w-full object-cover"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center text-[var(--color-accent)]">
					<TopIcon class="h-24 w-24" weight="bold" aria-hidden="true" />
				</div>
			{/if}
		</div>
	{/snippet}

	{#if hero}
		<section class="@container">
			<p class="card-label text-[var(--color-text-muted)]">{hero.label}</p>
			<p
				class="stat-value hero-value fit-value mt-2 leading-[0.95] text-[var(--color-text-primary)]"
				style:--fit-chars={scaledLength(hero.value, UNIT_SCALE.cardHeadline)}
				style:--fit-max="calc(360px * var(--stat-scale))"
			>
				<ValueWithUnits value={hero.value} unitScale={UNIT_SCALE.cardHeadline} tone="accent" />
			</p>
			<p class="fun-fact mt-4">{hero.funFact}</p>
		</section>
	{/if}

	<section class="mt-[60px]">
		<p class="card-label mb-3 text-[var(--color-text-muted)]">{i18n.m.common.dayByDay}</p>
		<YearLane
			variant="export"
			theme={appStore.theme}
			activities={appStore.activities}
			highlights={appStore.highlights}
			records={recordActivities(appStore.records)}
			year={TARGET_YEAR}
		/>
	</section>

	<dl class="results">
		{#each supporting as stat (stat.id)}
			<div class="result">
				<div class="min-w-0">
					<dt class="card-label text-[var(--color-text-muted)]">{stat.label}</dt>
					<dd class="fun-fact mt-1">{stat.funFact}</dd>
				</div>
				<dd class="@container w-[44%] shrink-0 text-right">
					<span
						class="stat-value fit-value block leading-none text-[var(--color-text-primary)]"
						style:--fit-chars={fitChars}
						style:--fit-max="calc(84px * var(--stat-scale))"
						><ValueWithUnits value={stat.value} unitScale={UNIT_SCALE.board} /></span
					>
				</dd>
			</div>
		{/each}
	</dl>
</ExportCardBase>

<style>
	.results {
		margin-top: auto;
		padding-top: 48px;
	}

	.result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 32px;
		padding: 26px 0;
		border-top: var(--panel-border-width) solid var(--color-border);
	}

	.result:last-child {
		border-bottom: var(--panel-border-width) solid var(--color-border);
	}
</style>
