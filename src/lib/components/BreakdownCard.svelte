<script lang="ts">
    import { appStore } from "#lib/stores/app.svelte.js";
    import {
        formatDistance,
        formatDuration,
        formatCalories,
    } from "#lib/utils/format.js";
    import {
        CalendarCheck,
        Lightning,
        Trophy,
        Hourglass,
        Fire,
    } from "phosphor-svelte";
    import {
        selectTopSports,
        weeklyBars,
        activeDaysPercent as yearShare,
    } from "#lib/utils/breakdown.js";
    import ExportCardBase from "./ExportCardBase.svelte";
    import SportDistribution from "./breakdown/SportDistribution.svelte";

    let currentTheme = $derived(appStore.theme);

    let topSports = $derived(
        selectTopSports(appStore.breakdown || [], appStore.breakdownMetric),
    );

    let totalActivities = $derived(appStore.stats?.activityCount ?? 0);

    const activeDaysPercent = $derived(
        yearShare(appStore.stats?.activeDays ?? 0),
    );
</script>

<ExportCardBase variant="breakdown" title="BREAKDOWN">
    {#if topSports.length > 0}
        <SportDistribution
            sports={topSports}
            metric={appStore.breakdownMetric}
            {totalActivities}
        />
    {/if}

    <!-- Weekly Activity Pattern -->
    {#if appStore.weeklyPattern.some((v) => v > 0)}
        {@const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]}
        {@const barContainerHeight = 100}
        <div class="mb-16 px-2">
            <div
                class="text-[18px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4 text-center"
            >
                When You Train
            </div>
            <div
                class="flex items-end justify-between gap-3"
                style="height: {barContainerHeight + 28}px;"
            >
                {#each weeklyBars(appStore.weeklyPattern, barContainerHeight) as { heightPercent, barHeight, isTopDay }, i}
                    <div
                        class="flex-1 flex flex-col items-center justify-end gap-2"
                    >
                        <div
                            class="w-full rounded-t-lg transition-all weekly-bar"
                            style="height: {barHeight}px; background: {isTopDay
                                ? '#00ff88'
                                : 'var(--color-accent)'}; opacity: {currentTheme ===
                            'minimalist'
                                ? 0.8
                                : 0.4 + (heightPercent / 100) * 0.6};"
                        ></div>
                        <span
                            class="text-[16px] font-bold text-[var(--color-text-muted)]"
                        >
                            {dayLabels[i]}
                        </span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Consistency Stats with Progress Rings -->
    <div class="grid grid-cols-2 gap-8 mb-16">
        <!-- Active Days -->
        <div
            class="flex flex-col items-center text-center p-8 rounded-2xl consistency-card"
        >
            <div class="w-44 h-44 mb-4">
                <svg viewBox="0 0 120 120" class="w-full h-full">
                    <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgba(0,0,0,0.05)"
                        class="progress-ring-bg"
                        stroke-width="10"
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="var(--color-accent)"
                        stroke-width="10"
                        stroke-dasharray="{activeDaysPercent * 3.27} 327"
                        stroke-linecap="round"
                        transform="rotate(-90 60 60)"
                        class="progress-ring"
                    />
                    <text
                        x="60"
                        y="60"
                        text-anchor="middle"
                        dominant-baseline="central"
                        fill="var(--color-text-primary)"
                        style="font-size: 38px; font-weight: 900; font-family: inherit;"
                        >{appStore.stats?.activeDays ?? 0}</text
                    >
                </svg>
            </div>
            <div
                class="flex items-center gap-3 text-[var(--color-accent)]"
            >
                <CalendarCheck class="w-8 h-8" weight="bold" />
                <span class="text-[28px] font-bold uppercase tracking-wider"
                    >Active Days</span
                >
            </div>
            <div
                class="text-[20px] text-[var(--color-text-muted)] mt-2 whitespace-nowrap"
            >
                {Math.round(activeDaysPercent)}% of the year
            </div>
        </div>

        <!-- Day Streak -->
        <div
            class="flex flex-col items-center text-center p-8 rounded-2xl consistency-card"
        >
            <div class="w-44 h-44 mb-4">
                <svg viewBox="0 0 120 120" class="w-full h-full">
                    <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgba(0,0,0,0.05)"
                        class="progress-ring-bg"
                        stroke-width="10"
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="#ff6b6b"
                        stroke-width="10"
                        stroke-dasharray="20 10"
                        stroke-linecap="round"
                        transform="rotate(-90 60 60)"
                        class="streak-ring"
                    />
                    <text
                        x="60"
                        y="60"
                        text-anchor="middle"
                        dominant-baseline="central"
                        fill="var(--color-text-primary)"
                        style="font-size: 38px; font-weight: 900; font-family: inherit;"
                        >{appStore.stats?.longestStreak ?? 0}</text
                    >
                </svg>
            </div>
            <div class="flex items-center gap-3 text-[#ff6b6b]">
                <Lightning class="w-8 h-8" weight="bold" />
                <span class="text-[28px] font-bold uppercase tracking-wider"
                    >Day Streak</span
                >
            </div>
            <div
                class="text-[20px] text-[var(--color-text-muted)] mt-2 whitespace-nowrap"
            >
                most consecutive active days
            </div>
        </div>
    </div>

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
