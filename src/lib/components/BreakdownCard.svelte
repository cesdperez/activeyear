<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte.js";
    import {
        formatDistance,
        formatDuration,
        formatCalories,
    } from "$lib/utils/format.js";
    import {
        CalendarCheck,
        Lightning,
        Trophy,
        Hourglass,
        Fire,
        Target,
    } from "phosphor-svelte";
    import {
        sportNames,
        sportIcons,
        sportColors,
    } from "$lib/constants/sports.js";
    import { consolidateBreakdown } from "$lib/utils/activity.js";
    import ExportCardBase from "./ExportCardBase.svelte";

    let currentTheme = $derived(appStore.theme);

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

    let topSportsCount = $derived(
        topSports.reduce((sum, s) => sum + s.count, 0),
    );

    let totalActivities = $derived(appStore.stats?.activityCount ?? 0);

    const maxSportCount = $derived(
        Math.max(...topSports.map((s) => s[appStore.breakdownMetric]), 1),
    );

    const activeDaysPercent = $derived(
        Math.min(((appStore.stats?.activeDays ?? 0) / 365) * 100, 100),
    );

    const circumference = 2 * Math.PI * 80;
</script>

<ExportCardBase variant="breakdown" title="BREAKDOWN">
    <!-- Radial Sport Distribution Chart -->
    {#if topSports.length > 0}
        <div class="flex items-center gap-12 mb-32 px-4">
            <!-- Left: Radial Sport Distribution Chart -->
            <div class="shrink-0 relative">
                <div class="donut-chart-container !w-[280px] !h-[280px]">
                    <svg viewBox="0 0 200 200" class="donut-chart">
                        <!-- Background circle -->
                        <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="rgba(0,0,0,0.05)"
                            class="donut-bg"
                            stroke-width="28"
                        />
                        <!-- Sport segments -->
                        {#each topSports as sport, i}
                            {@const percentage = sport.count / topSportsCount}
                            {@const offset = topSports
                                .slice(0, i)
                                .reduce(
                                    (sum, s) =>
                                        sum +
                                        (s.count / topSportsCount) *
                                            circumference,
                                    0,
                                )}
                            <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke={sportColors[i % sportColors.length]}
                                stroke-width="28"
                                stroke-dasharray="{percentage * circumference -
                                    4} {circumference}"
                                stroke-dashoffset={-offset}
                                stroke-linecap="round"
                                transform="rotate(-90 100 100)"
                                class="donut-segment"
                                style="filter: drop-shadow(0 0 8px {sportColors[
                                    i % sportColors.length
                                ]}40);"
                            />
                        {/each}
                        <text
                            x="100"
                            y="95"
                            text-anchor="middle"
                            dominant-baseline="central"
                            fill="var(--color-text-primary)"
                            style="font-size: 52px; font-weight: 900; font-family: inherit;"
                            >{totalActivities}</text
                        >
                        <text
                            x="100"
                            y="130"
                            text-anchor="middle"
                            dominant-baseline="central"
                            fill="var(--color-text-muted)"
                            style="font-size: 14px; font-weight: 700; font-family: inherit; letter-spacing: 0.1em; text-transform: uppercase;"
                            >Activities</text
                        >
                    </svg>
                </div>
            </div>

            <!-- Right: Sport Bars -->
            <div class="flex-1 space-y-6">
                {#each topSports as sport, i}
                    {@const IconComponent = sportIcons[sport.type] ?? Target}
                    {@const value = sport[appStore.breakdownMetric]}
                    {@const percentage = (value / maxSportCount) * 100}
                    {@const color = sportColors[i % sportColors.length]}

                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style="background: {color}20; color: {color};"
                                >
                                    <IconComponent
                                        class="w-5 h-5"
                                        weight="bold"
                                    />
                                </div>
                                <span
                                    class="text-[24px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide"
                                >
                                    {sportNames[sport.type] ?? sport.type}
                                </span>
                            </div>
                            <div class="text-right">
                                <div
                                    class="text-[22px] font-bold text-[var(--color-text-primary)] leading-none whitespace-nowrap"
                                >
                                    {appStore.breakdownMetric === "count"
                                        ? value
                                        : formatDuration(value)}
                                </div>
                            </div>
                        </div>
                        <div
                            class="h-3 bg-[rgba(0,0,0,0.05)] sport-bar-bg rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full rounded-full transition-all duration-500"
                                style="width: {percentage}%; background: {color}; filter: drop-shadow(0 0 4px {color}40);"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Weekly Activity Pattern -->
    {#if appStore.weeklyPattern.some((v) => v > 0)}
        {@const maxDay = Math.max(...appStore.weeklyPattern, 1)}
        {@const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]}
        {@const barContainerHeight = 100}
        {@const sortedIndices = appStore.weeklyPattern
            .map((count, idx) => ({ count, idx }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 2)
            .map((item) => item.idx)}
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
                {#each appStore.weeklyPattern as count, i}
                    {@const heightPercent = (count / maxDay) * 100}
                    {@const barHeight = Math.max(
                        (heightPercent / 100) * barContainerHeight,
                        8,
                    )}
                    {@const isTopDay = sortedIndices.includes(i)}
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
