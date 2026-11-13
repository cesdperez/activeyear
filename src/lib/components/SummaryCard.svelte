<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import {
		formatDistance,
		formatDuration,
		formatCalories,
		formatElevation,
		formatEarthLaps,
		formatEverests,
		formatPizzaSlices,
		formatLotRMarathons,
		showsValue
	} from '#lib/utils/format.js';
	import { Ruler, Timer, Mountains, Fire, Target } from 'phosphor-svelte';
	import { sportIcons } from '#lib/constants/sports.js';
	import { consolidateBreakdown } from '#lib/utils/activity.js';
	import ExportCardBase from './ExportCardBase.svelte';

	let consolidatedBreakdownData = $derived(consolidateBreakdown(appStore.breakdown || []));

	let topSports = $derived(
		[...consolidatedBreakdownData]
			.sort((a, b) => b[appStore.breakdownMetric] - a[appStore.breakdownMetric])
			.slice(0, 4)
	);

	let topSportIcon = $derived(
		topSports.length === 0 ? Target : (sportIcons[topSports[0].type] ?? Target)
	);

	const allStats = $derived([
		{
			id: 'distance',
			label: i18n.m.export.totalDistance,
			value: formatDistance(i18n.locale, appStore.stats?.totalDistance ?? 0, appStore.unit),
			icon: Ruler,
			equivalent: `🌍 ${formatEarthLaps(i18n.locale, appStore.stats?.totalDistance ?? 0)}`
		},
		{
			id: 'elevation',
			label: i18n.m.export.elevation,
			value: formatElevation(i18n.locale, appStore.stats?.totalElevation ?? 0, appStore.unit),
			icon: Mountains,
			equivalent: `🏔️ ${formatEverests(i18n.locale, appStore.stats?.totalElevation ?? 0)}`
		},
		{
			id: 'duration',
			label: i18n.m.export.timeActive,
			value: formatDuration(i18n.locale, appStore.stats?.totalDuration ?? 0),
			icon: Timer,
			equivalent: `💍 ${formatLotRMarathons(i18n.locale, appStore.stats?.totalDuration ?? 0)}`
		},
		{
			id: 'calories',
			label: i18n.m.export.calories,
			value: formatCalories(i18n.locale, appStore.stats?.totalCalories ?? 0),
			icon: Fire,
			equivalent: `🍕 ${formatPizzaSlices(i18n.locale, appStore.stats?.totalCalories ?? 0)}`
		}
	]);

	let heroStat = $derived(allStats.find((s) => s.id === appStore.summaryMetric) || allStats[0]);

	let supportingStats = $derived(
		allStats.filter((s) => s.id !== heroStat.id && showsValue(s.value))
	);

	// Middle cells draw both dividers so they sit right against the middle stat.
	function dividerClass(index: number, count: number): string {
		if (count === 2 && index === 1) return 'border-l';
		return index > 0 && index < count - 1 ? 'border-r border-l' : '';
	}
</script>

<ExportCardBase variant="summary" title={i18n.m.export.yearInSport}>
	<!-- User Avatar / Sport Icon -->
	<div class="relative -mt-[30px] mb-[140px] flex justify-center">
		<!-- Decorative Spiral Effects -->
		<div class="avatar-decorations">
			<svg viewBox="0 0 200 200" class="spiral-svg" aria-hidden="true" focusable="false">
				<ellipse
					cx="100"
					cy="100"
					rx="90"
					ry="30"
					transform="rotate(-30 100 100)"
					fill="none"
					stroke="var(--color-accent)"
					stroke-width="1.5"
					stroke-linecap="round"
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
					stroke="var(--color-accent)"
					stroke-width="1"
					stroke-linecap="round"
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
					stroke="var(--color-accent)"
					stroke-width="0.8"
					stroke-linecap="round"
					stroke-dasharray="100 200"
					opacity="0.2"
				/>
				<circle
					cx="100"
					cy="100"
					r="78"
					stroke-dasharray="10 20"
					fill="none"
					stroke="var(--color-accent)"
					stroke-width="0.5"
					stroke-linecap="round"
				/>
				<circle
					cx="100"
					cy="100"
					r="82"
					opacity="0.3"
					fill="none"
					stroke="var(--color-accent)"
					stroke-width="0.5"
					stroke-linecap="round"
					stroke-dasharray="5 15"
				/>
			</svg>
		</div>

		<div class="avatar-glow"></div>
		<div class="avatar-container">
			{#if appStore.userPfp}
				<img
					src={appStore.userPfp}
					alt={i18n.m.export.profile}
					class="h-full w-full rounded-full object-cover"
				/>
			{:else}
				{@const TopIcon = topSportIcon}
				<div class="flex h-full w-full items-center justify-center text-[var(--color-accent)]">
					<TopIcon class="h-56 w-56" weight="bold" aria-hidden="true" />
				</div>
			{/if}
		</div>
	</div>

	<!-- Hero Stat -->
	<div class="flex flex-1 flex-col items-center justify-start gap-4 text-center">
		<div class="mb-[60px]">
			<div class="mb-4 flex items-center justify-center gap-4 text-[var(--color-accent)]">
				<heroStat.icon class="h-16 w-16" weight="bold" aria-hidden="true" />
			</div>
			<div
				style:--chars={i18n.locale === 'en' ? 1 : heroStat.value.length}
				class="stat-value text-[min(140px,calc(1350px/var(--chars)))] leading-none font-bold -tracking-[0.04em] text-[var(--color-text-primary)]"
			>
				{heroStat.value}
			</div>
			<div
				class="mt-4 text-[32px] font-medium tracking-[0.2em] text-[var(--color-text-dim)] uppercase"
			>
				{heroStat.label}
			</div>
			<div class="mt-8 text-[44px] font-bold text-[var(--color-accent)]">
				{heroStat.equivalent}
			</div>
		</div>

		<!-- Separator -->
		<div class="mb-[72px] h-2 w-64 rounded-full bg-[var(--color-accent)] opacity-40"></div>

		<!-- Supporting Stats Row -->
		<div
			class="grid w-full gap-4"
			style="grid-template-columns: repeat({supportingStats.length}, minmax(0, 1fr));"
		>
			{#each supportingStats as stat, i (stat.id)}
				<div
					class="overflow-visible border-white/10 text-center {dividerClass(
						i,
						supportingStats.length
					)}"
				>
					<stat.icon
						class="mx-auto mb-3 h-12 w-12 text-[var(--color-text-dim)]"
						weight="bold"
						aria-hidden="true"
					/>
					<div
						class="stat-value text-[48px] leading-none font-bold text-[var(--color-text-primary)]"
					>
						{stat.value}
					</div>
					<div class="mt-2 text-[18px] tracking-widest text-[var(--color-text-muted)] uppercase">
						{stat.label}
					</div>
					<div class="mt-2 text-[22px] font-medium text-[var(--color-accent)]">
						{stat.equivalent}
					</div>
				</div>
			{/each}
		</div>
	</div>
</ExportCardBase>
