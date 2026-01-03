<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte.js";
    import {
        formatDistance,
        formatDuration,
        formatCalories,
        formatElevation,
        formatEarthLaps,
        formatEverests,
        formatPizzaSlices,
        formatLotRMarathons,
    } from "$lib/utils/format.js";
    import { Ruler, Timer, Mountains, Fire, Target } from "phosphor-svelte";
    import { sportIcons } from "$lib/constants/sports.js";
    import { consolidateBreakdown } from "$lib/utils/activity.js";
    import ExportCardBase from "./ExportCardBase.svelte";

    let consolidatedBreakdownData = $derived(
        consolidateBreakdown(appStore.breakdown || []),
    );

    let topSports = $derived(
        [...consolidatedBreakdownData]
            .sort(
                (a, b) =>
                    b[appStore.breakdownMetric] - a[appStore.breakdownMetric],
            )
            .slice(0, 4),
    );

    let topSportIcon = $derived(
        topSports.length === 0
            ? Target
            : (sportIcons[topSports[0].type] ?? Target),
    );

    const allStats = $derived([
        {
            id: "distance",
            label: "Total Distance",
            value: formatDistance(
                appStore.stats?.totalDistance ?? 0,
                appStore.unit,
            ),
            icon: Ruler,
            equivalent: `🌍 ${formatEarthLaps(appStore.stats?.totalDistance ?? 0)}`,
        },
        {
            id: "elevation",
            label: "Elevation",
            value: formatElevation(
                appStore.stats?.totalElevation ?? 0,
                appStore.unit,
            ),
            icon: Mountains,
            equivalent: `🏔️ ${formatEverests(appStore.stats?.totalElevation ?? 0)}`,
        },
        {
            id: "duration",
            label: "Time Active",
            value: formatDuration(appStore.stats?.totalDuration ?? 0),
            icon: Timer,
            equivalent: `💍 ${formatLotRMarathons(appStore.stats?.totalDuration ?? 0)}`,
        },
        {
            id: "calories",
            label: "Calories",
            value: formatCalories(appStore.stats?.totalCalories ?? 0),
            icon: Fire,
            equivalent: `🍕 ${formatPizzaSlices(appStore.stats?.totalCalories ?? 0)}`,
        },
    ]);

    let heroStat = $derived(
        allStats.find((s) => s.id === appStore.summaryMetric) || allStats[0],
    );

    let supportingStats = $derived(
        allStats.filter((s) => s.id !== heroStat.id),
    );
</script>

<ExportCardBase variant="summary" title="YEAR IN SPORT">
    <!-- User Avatar / Sport Icon -->
    <div class="flex justify-center mb-[140px] relative -mt-[30px]">
        <!-- Decorative Spiral Effects -->
        <div class="avatar-decorations">
            <svg viewBox="0 0 200 200" class="spiral-svg">
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

        <div class="avatar-container">
            {#if appStore.userPfp}
                <img
                    src={appStore.userPfp}
                    alt="Profile"
                    class="w-full h-full object-cover rounded-full"
                />
            {:else}
                {@const TopIcon = topSportIcon}
                <div
                    class="w-full h-full flex items-center justify-center text-[var(--color-accent)]"
                >
                    <TopIcon class="w-56 h-56" weight="bold" />
                </div>
            {/if}
        </div>
    </div>

    <!-- Hero Stat -->
    <div
        class="flex-1 flex flex-col justify-start items-center text-center gap-4"
    >
        <div class="mb-[60px]">
            <div
                class="flex items-center justify-center gap-4 mb-4 text-[var(--color-accent)]"
            >
                <heroStat.icon class="w-16 h-16" weight="bold" />
            </div>
            <div
                class="text-[140px] font-bold stat-value text-[var(--color-text-primary)] leading-none -tracking-[0.04em]"
            >
                {heroStat.value}
            </div>
            <div
                class="text-[32px] font-medium text-[var(--color-text-dim)] uppercase tracking-[0.2em] mt-4"
            >
                {heroStat.label}
            </div>
            <div class="text-[44px] font-bold text-[var(--color-accent)] mt-8">
                {heroStat.equivalent}
            </div>
        </div>

        <!-- Separator -->
        <div
            class="w-64 h-2 bg-[var(--color-accent)] opacity-40 rounded-full mb-[72px]"
        ></div>

        <!-- Supporting Stats Row -->
        <div class="grid grid-cols-3 gap-4 w-full">
            {#each supportingStats as stat, i}
                <div
                    class="text-center overflow-visible {i === 1
                        ? 'border-l border-r border-white/10'
                        : ''}"
                >
                    <stat.icon
                        class="w-12 h-12 text-[var(--color-text-dim)] mb-3 mx-auto"
                        weight="bold"
                    />
                    <div
                        class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                    >
                        {stat.value}
                    </div>
                    <div
                        class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest mt-2"
                    >
                        {stat.label}
                    </div>
                    <div
                        class="text-[22px] text-[var(--color-accent)] mt-2 font-medium"
                    >
                        {stat.equivalent}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</ExportCardBase>
