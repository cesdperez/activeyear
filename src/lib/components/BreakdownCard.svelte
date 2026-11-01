<script lang="ts">
    import { appStore } from "#lib/stores/app.svelte.js";
    import {
        formatDistance,
        formatDuration,
        formatCalories,
    } from "#lib/utils/format.js";
    import {
        Trophy,
        Hourglass,
        Fire,
    } from "phosphor-svelte";
    import { selectTopSports } from "#lib/utils/breakdown.js";
    import ExportCardBase from "./ExportCardBase.svelte";
    import SportDistribution from "./breakdown/SportDistribution.svelte";
    import WeeklyPatternChart from "./breakdown/WeeklyPatternChart.svelte";
    import ConsistencyStats from "./breakdown/ConsistencyStats.svelte";

    let topSports = $derived(
        selectTopSports(appStore.breakdown || [], appStore.breakdownMetric),
    );

    let totalActivities = $derived(appStore.stats?.activityCount ?? 0);
</script>

<ExportCardBase variant="breakdown" title="BREAKDOWN">
    {#if topSports.length > 0}
        <SportDistribution
            sports={topSports}
            metric={appStore.breakdownMetric}
            {totalActivities}
        />
    {/if}

    {#if appStore.weeklyPattern.some((v) => v > 0)}
        <WeeklyPatternChart
            pattern={appStore.weeklyPattern}
            theme={appStore.theme}
        />
    {/if}

    <ConsistencyStats
        activeDays={appStore.stats?.activeDays ?? 0}
        longestStreak={appStore.stats?.longestStreak ?? 0}
    />

    <!-- Personal Records -->
    {#if appStore.records}
        <div class="mb-auto">
            <div class="flex items-center gap-6 mb-6">
                <div
                    class="h-1 flex-1 bg-gradient-to-l from-[var(--color-accent)] to-transparent opacity-30"
                ></div>
                <h2
                    class="text-[44px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest whitespace-nowrap"
                >
                    Personal Records
                </h2>
                <div
                    class="h-1 flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-30"
                ></div>
            </div>

            <div class="grid grid-cols-3 gap-6">
                {#if appStore.records.longestDistance}
                    {@const record = appStore.records.longestDistance}
                    <div class="record-card-compact">
                        <div class="record-icon-compact">
                            <Trophy class="w-14 h-14" weight="fill" />
                        </div>
                        <div
                            class="text-[42px] font-black text-[var(--color-text-primary)] leading-tight whitespace-nowrap"
                        >
                            {formatDistance(record.value, appStore.unit)}
                        </div>
                        <div
                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest whitespace-nowrap"
                        >
                            Longest Distance
                        </div>
                        <div
                            class="text-[16px] text-[var(--color-accent)] mt-2 font-medium line-clamp-2 w-full"
                        >
                            {record.activity.title}
                        </div>
                    </div>
                {/if}
                {#if appStore.records.longestDuration}
                    {@const record = appStore.records.longestDuration}
                    <div class="record-card-compact">
                        <div class="record-icon-compact">
                            <Hourglass class="w-14 h-14" weight="fill" />
                        </div>
                        <div
                            class="text-[42px] font-black text-[var(--color-text-primary)] leading-tight whitespace-nowrap"
                        >
                            {formatDuration(record.value)}
                        </div>
                        <div
                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest whitespace-nowrap"
                        >
                            Longest Duration
                        </div>
                        <div
                            class="text-[16px] text-[var(--color-accent)] mt-2 font-medium line-clamp-2 w-full"
                        >
                            {record.activity.title}
                        </div>
                    </div>
                {/if}
                {#if appStore.records.biggestBurn}
                    {@const record = appStore.records.biggestBurn}
                    <div class="record-card-compact">
                        <div class="record-icon-compact">
                            <Fire class="w-14 h-14" weight="fill" />
                        </div>
                        <div
                            class="text-[42px] font-black text-[var(--color-text-primary)] leading-tight whitespace-nowrap"
                        >
                            {formatCalories(record.value)}
                        </div>
                        <div
                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest whitespace-nowrap"
                        >
                            Biggest Burn
                        </div>
                        <div
                            class="text-[16px] text-[var(--color-accent)] mt-2 font-medium line-clamp-2 w-full"
                        >
                            {record.activity.title}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</ExportCardBase>
