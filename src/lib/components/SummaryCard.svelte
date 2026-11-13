<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { showsValue } from '#lib/utils/format.js';
	import { scaledLength, totalStats, UNIT_SCALE } from '#lib/utils/totals.js';
	import { recordActivities } from '#lib/utils/yearLane.js';
	import { CENTERED_AVATAR_THEMES } from '#lib/constants/themes.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { Target } from 'phosphor-svelte';
	import { sportIcons } from '#lib/constants/sports.js';
	import { rankSports } from '#lib/utils/breakdown.js';
	import ExportCardBase from './ExportCardBase.svelte';
	import ValueWithUnits from './ValueWithUnits.svelte';
	import YearLane from './widgets/YearLane.svelte';

	const centeredAvatar = $derived(CENTERED_AVATAR_THEMES.includes(appStore.theme));
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

{#snippet avatar()}
	<div class="avatar-container">
		{#if appStore.userPfp}
			<img src={appStore.userPfp} alt={i18n.m.export.profile} class="h-full w-full object-cover" />
		{:else}
			<div class="flex h-full w-full items-center justify-center text-[var(--color-accent)]">
				<TopIcon class="h-24 w-24" weight="bold" aria-hidden="true" />
			</div>
		{/if}
	</div>
{/snippet}

<ExportCardBase variant="summary" title={i18n.m.export.yearInSport}>
	{#snippet headerAside()}
		{#if !centeredAvatar}{@render avatar()}{/if}
	{/snippet}

	{#if centeredAvatar}
		<div class="centered-avatar">
			<svg viewBox="0 0 200 200" class="avatar-decorations" aria-hidden="true" focusable="false">
				<ellipse
					cx="100"
					cy="100"
					rx="90"
					ry="30"
					transform="rotate(-30 100 100)"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-dasharray="200 100"
					opacity="0.4"
				/>
				<ellipse
					cx="100"
					cy="100"
					rx="90"
					ry="30"
					transform="rotate(45 100 100)"
					fill="none"
					stroke="currentColor"
					stroke-width="1"
					stroke-dasharray="150 150"
					opacity="0.25"
				/>
				<ellipse
					cx="100"
					cy="100"
					rx="95"
					ry="40"
					transform="rotate(120 100 100)"
					fill="none"
					stroke="currentColor"
					stroke-width="0.8"
					stroke-dasharray="100 200"
					opacity="0.2"
				/>
				<circle
					cx="100"
					cy="100"
					r="78"
					stroke-dasharray="10 20"
					fill="none"
					stroke="currentColor"
					stroke-width="0.5"
				/>
				<circle
					cx="100"
					cy="100"
					r="82"
					opacity="0.3"
					fill="none"
					stroke="currentColor"
					stroke-width="0.5"
					stroke-dasharray="5 15"
				/>
			</svg>
			<div class="avatar-glow"></div>
			{@render avatar()}
		</div>
	{/if}

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

	<section class:compact-lane={centeredAvatar} class="mt-[60px]">
		<p class="card-label mb-3 text-[var(--color-text-muted)]">{i18n.m.common.dayByDay}</p>
		<YearLane
			variant="export"
			theme={appStore.theme}
			activities={appStore.activities}
			highlights={appStore.highlights}
			records={recordActivities(appStore.records)}
			year={TARGET_YEAR}
			elapsedDays={appStore.daysCounted}
			yearSoFar={appStore.yearSoFar}
		/>
	</section>

	<dl class:compact-results={centeredAvatar} class="results">
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
	.centered-avatar {
		position: relative;
		display: flex;
		justify-content: center;
		margin: 0 auto var(--summary-avatar-margin, 20px);
	}

	.avatar-decorations {
		position: absolute;
		width: 500px;
		height: 500px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(-15deg);
		color: var(--avatar-decoration, var(--color-accent));
		pointer-events: none;
	}

	.avatar-glow {
		position: absolute;
		width: 370px;
		height: 370px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(
			circle closest-side,
			var(--color-accent-glow) 82%,
			transparent 100%
		);
	}

	.centered-avatar :global(.avatar-container) {
		position: relative;
		width: var(--summary-avatar-size, 320px);
		height: var(--summary-avatar-size, 320px);
		border-color: var(--avatar-border, var(--color-accent));
		border-radius: var(--avatar-radius, 50%);
		box-shadow: var(--avatar-shadow, none);
	}

	.compact-lane {
		margin-top: var(--summary-lane-margin, 30px);
	}
	.compact-results {
		padding-top: var(--summary-results-padding, 24px);
	}
	.compact-results .result {
		padding: var(--summary-result-padding, 16px) 0;
	}

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
