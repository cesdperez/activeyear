<script module lang="ts">
    export function getExportElement(): HTMLElement | null {
        return document.getElementById("export-card");
    }
</script>

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
    import { getExportDimensions } from "$lib/utils/export.js";
    import type { CardVariant } from "$lib/types/index.js";

    // Phosphor icons
    import {
        Ruler,
        Timer,
        CalendarCheck,
        Lightning,
        Trophy,
        Hourglass,
        Sparkle,
        Mountains,
        Fire,
        Heart,
        PersonSimpleRun,
        PersonSimpleBike,
        PersonSimpleSwim,
        PersonSimpleWalk,
        Barbell,
        PersonSimpleTaiChi,
        Target,
    } from "phosphor-svelte";

    // Sport icons mapping (using Phosphor for bold, activity-specific icons)
    const sportIcons: Record<string, typeof PersonSimpleRun> = {
        running: PersonSimpleRun,
        cycling: PersonSimpleBike,
        swimming: PersonSimpleSwim,
        walking: PersonSimpleWalk,
        hiking: Mountains,
        strength: Barbell,
        yoga: PersonSimpleTaiChi,
        other: Target,
    };

    // Sport type display names
    const sportNames: Record<string, string> = {
        running: "Running",
        cycling: "Cycling",
        swimming: "Swimming",
        walking: "Walking",
        hiking: "Hiking",
        strength: "Strength",
        yoga: "Yoga",
        other: "Other",
    };

    // Base dimensions for 9:16 aspect ratio
    let dimensions = $derived(getExportDimensions());

    // Props
    let { variant = "summary" }: { variant?: CardVariant } = $props();

    // Reactive scale factor for preview (show smaller version)
    let scale = $state(0.35);

    $effect(() => {
        if (typeof window === "undefined") return;

        function updateScale() {
            // dimensions.width is 1080.
            // We want to fit it in the viewport with some padding.
            // On mobile, the Dashboard has px-4 (16px) or sm:px-6 (24px).
            const padding = window.innerWidth < 640 ? 48 : 80;
            const availableWidth = Math.min(window.innerWidth - padding, 400);
            const targetScale = availableWidth / 1080;
            scale = Math.min(0.35, targetScale);
        }

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    });

    // Consolidate small sports (less than 1 hour) into "other"
    const ONE_HOUR_IN_SECONDS = 3600;
    let consolidatedBreakdown = $derived(() => {
        const breakdown = appStore.breakdown || [];
        const result: typeof breakdown = [];
        let otherEntry: (typeof breakdown)[0] | null = null;

        for (const sport of breakdown) {
            if (sport.type === "other") {
                otherEntry = { ...sport };
            } else if (sport.duration < ONE_HOUR_IN_SECONDS) {
                if (!otherEntry) {
                    otherEntry = {
                        type: "other",
                        distance: 0,
                        duration: 0,
                        count: 0,
                    };
                }
                otherEntry.distance += sport.distance;
                otherEntry.duration += sport.duration;
                otherEntry.count += sport.count;
            } else {
                result.push(sport);
            }
        }

        if (otherEntry && otherEntry.count > 0) {
            result.push(otherEntry);
        }

        return result;
    });

    // Top 5 sports for the card (from consolidated breakdown)
    let topSports = $derived(
        [...consolidatedBreakdown()]
            .sort(
                (a, b) =>
                    b[appStore.breakdownMetric] - a[appStore.breakdownMetric],
            )
            .slice(0, 4),
    );

    // Current theme
    let currentTheme = $derived(appStore.theme);

    // Theme-specific classes
    let themeClasses = $derived(
        {
            neon: "theme-neon",
            minimalist: "theme-minimalist",
            retro: "theme-retro",
        }[currentTheme],
    );

    // Scaled dimensions for the wrapper
    let scaledWidth = $derived(dimensions.width * scale);
    let scaledHeight = $derived(dimensions.height * scale);

    // Calculate progress bar widths for sports breakdown
    const maxSportCount = $derived(
        Math.max(...topSports.map((s) => s[appStore.breakdownMetric]), 1),
    );

    // Get top sport icon
    let topSportIcon = $derived(() => {
        if (topSports.length === 0) return Target;
        return sportIcons[topSports[0].type] ?? Target;
    });
</script>

<!-- Export Card Container -->
<div
    class="export-card-wrapper"
    style="width: {scaledWidth}px; height: {scaledHeight}px;"
>
    <div
        style="width: {dimensions.width}px; height: {dimensions.height}px; transform: scale({scale}); transform-origin: top left;"
    >
        <div
            class="export-card {themeClasses}"
            id="export-card"
            data-theme={currentTheme}
            data-variant={variant}
            style="width: {dimensions.width}px; height: {dimensions.height}px;"
        >
            <!-- Background -->
            <div class="absolute inset-0 export-background"></div>

            <!-- Noise texture (Neon only) -->
            {#if currentTheme === "neon"}
                <div
                    class="absolute inset-0 opacity-[0.03]"
                    style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E');"
                ></div>
            {/if}

            <!-- Content -->
            <div class="relative z-10 h-full flex flex-col p-14">
                {#if variant === "summary"}
                    <!-- ===================== -->
                    <!-- SUMMARY CARD VARIANT -->
                    <!-- ===================== -->

                    <!-- Header -->
                    <header class="text-center mb-[160px] relative">
                        {#if appStore.userName}
                            <p
                                class="text-[42px] font-bold text-[var(--color-accent)] mb-2 relative z-10 leading-none uppercase tracking-widest mr-[-0.1em]"
                            >
                                {appStore.userName}'s
                            </p>
                        {/if}
                        <div class="flex flex-col items-center justify-center">
                            <h2
                                class="text-[140px] font-black text-[var(--color-text-primary)] leading-[0.8] mb-2 tracking-tighter mr-[0.05em]"
                            >
                                2025
                            </h2>
                            <h1
                                class="text-[72px] font-bold tracking-[0.15em] export-title leading-none relative z-10 uppercase text-[var(--color-text-dim)] mr-[-0.15em]"
                            >
                                YEAR IN SPORT
                            </h1>
                        </div>
                    </header>

                    <!-- User Avatar / Sport Icon -->
                    <div class="flex justify-center mb-[140px] relative">
                        <!-- Decorative Spiral Effects (Static for Export) -->
                        <div class="avatar-decorations">
                            <svg viewBox="0 0 200 200" class="spiral-svg">
                                <!-- Orbiting Rings with Perspective -->
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

                                <!-- Concentric Accents -->
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
                                {@const TopIcon = topSportIcon()}
                                <div
                                    class="w-full h-full flex items-center justify-center text-[var(--color-accent)]"
                                >
                                    <TopIcon class="w-56 h-56" weight="bold" />
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Hero Stat: Featured Metric with Fun Equivalent -->
                    {@const allStats = [
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
                            value: formatDuration(
                                appStore.stats?.totalDuration ?? 0,
                            ),
                            icon: Timer,
                            equivalent: `💍 ${formatLotRMarathons(appStore.stats?.totalDuration ?? 0)}`,
                        },
                        {
                            id: "calories",
                            label: "Calories",
                            value: formatCalories(
                                appStore.stats?.totalCalories ?? 0,
                            ),
                            icon: Fire,
                            equivalent: `🍕 ${formatPizzaSlices(appStore.stats?.totalCalories ?? 0)}`,
                        },
                    ]}
                    {@const heroStat =
                        allStats.find((s) => s.id === appStore.summaryMetric) ||
                        allStats[0]}
                    {@const supportingStats = allStats.filter(
                        (s) => s.id !== heroStat.id,
                    )}

                    <div
                        class="flex-1 flex flex-col justify-start items-center text-center gap-4"
                    >
                        <!-- Hero Stat - Floating -->
                        <div class="mb-[60px]">
                            <div
                                class="flex items-center justify-center gap-4 mb-4 text-[var(--color-accent)]"
                            >
                                <heroStat.icon
                                    class="w-16 h-16"
                                    weight="bold"
                                />
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
                            <div
                                class="text-[44px] font-bold text-[var(--color-accent)] mt-8"
                            >
                                {heroStat.equivalent}
                            </div>
                        </div>

                        <!-- Separator -->
                        <div
                            class="w-64 h-2 bg-[var(--color-accent)] opacity-40 rounded-full mb-[72px]"
                        ></div>

                        <!-- Supporting Stats Row - Clean Grid -->
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

                    <!-- Watermark -->
                    <div class="mt-auto pt-8 text-center">
                        <p
                            class="text-[24px] text-[var(--color-text-dim)] font-medium tracking-widest opacity-80"
                        >
                            activeyear.app
                        </p>
                    </div>
                {:else if variant === "breakdown"}
                    <!-- ======================== -->
                    <!-- BREAKDOWN CARD VARIANT   -->
                    <!-- ======================== -->

                    {@const topSportsCount = topSports.reduce(
                        (sum, s) => sum + s.count,
                        0,
                    )}
                    {@const totalActivities =
                        appStore.stats?.activityCount ?? 0}
                    {@const sportColors = [
                        "#00d4ff",
                        "#00ff88",
                        "#ff6b6b",
                        "#ffd93d",
                        "#c084fc",
                    ]}

                    <!-- Header with Username -->
                    <header class="text-center mb-[130px] relative">
                        {#if appStore.userName}
                            <p
                                class="text-[42px] font-bold text-[var(--color-accent)] mb-2 relative z-10 leading-none uppercase tracking-widest mr-[-0.1em]"
                            >
                                {appStore.userName}'s
                            </p>
                        {/if}
                        <div class="flex flex-col items-center justify-center">
                            <h2
                                class="text-[140px] font-black text-[var(--color-text-primary)] leading-[0.8] mb-2 tracking-tighter mr-[0.05em]"
                            >
                                2025
                            </h2>
                            <h1
                                class="text-[72px] font-bold tracking-[0.15em] export-title leading-none relative z-10 uppercase text-[var(--color-text-dim)] mr-[-0.15em]"
                            >
                                BREAKDOWN
                            </h1>
                        </div>
                    </header>

                    <!-- Radial Sport Distribution Chart -->
                    {#if topSports.length > 0}
                        <div class="flex items-center gap-12 mb-32 px-4">
                            <!-- Left: Radial Sport Distribution Chart -->
                            <div class="shrink-0 relative">
                                <div
                                    class="donut-chart-container !w-[280px] !h-[280px]"
                                >
                                    {#if true}
                                        {@const circumference =
                                            2 * Math.PI * 80}
                                        <svg
                                            viewBox="0 0 200 200"
                                            class="donut-chart"
                                        >
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
                                                {@const percentage =
                                                    sport.count /
                                                    topSportsCount}
                                                {@const offset = topSports
                                                    .slice(0, i)
                                                    .reduce(
                                                        (sum, s) =>
                                                            sum +
                                                            (s.count /
                                                                topSportsCount) *
                                                                circumference,
                                                        0,
                                                    )}
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="80"
                                                    fill="none"
                                                    stroke={sportColors[
                                                        i % sportColors.length
                                                    ]}
                                                    stroke-width="28"
                                                    stroke-dasharray="{percentage *
                                                        circumference -
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
                                    {/if}
                                </div>
                            </div>

                            <!-- Right: Sport Bars (Similar to Dashboard) -->
                            <div class="flex-1 space-y-6">
                                {#each topSports as sport, i}
                                    {@const IconComponent =
                                        sportIcons[sport.type] ?? Target}
                                    {@const value =
                                        sport[appStore.breakdownMetric]}
                                    {@const percentage =
                                        (value / maxSportCount) * 100}
                                    {@const color =
                                        sportColors[i % sportColors.length]}

                                    <div class="flex flex-col gap-2">
                                        <div
                                            class="flex justify-between items-center"
                                        >
                                            <div
                                                class="flex items-center gap-3"
                                            >
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
                                                    {sportNames[sport.type] ??
                                                        sport.type}
                                                </span>
                                            </div>
                                            <div class="text-right">
                                                <div
                                                    class="text-[22px] font-bold text-[var(--color-text-primary)] leading-none whitespace-nowrap"
                                                >
                                                    {appStore.breakdownMetric ===
                                                    "count"
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
                                    {@const heightPercent =
                                        (count / maxDay) * 100}
                                    {@const barHeight = Math.max(
                                        (heightPercent / 100) *
                                            barContainerHeight,
                                        8,
                                    )}
                                    {@const isTopDay =
                                        sortedIndices.includes(i)}
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
                                                : 0.4 +
                                                  (heightPercent / 100) * 0.6};"
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
                    {#if true}
                        {@const activeDaysPercent = Math.min(
                            ((appStore.stats?.activeDays ?? 0) / 365) * 100,
                            100,
                        )}
                        <div class="grid grid-cols-2 gap-8 mb-16">
                            <!-- Active Days -->
                            <div
                                class="flex flex-col items-center text-center p-8 rounded-2xl consistency-card"
                            >
                                <div class="w-44 h-44 mb-4">
                                    <svg
                                        viewBox="0 0 120 120"
                                        class="w-full h-full"
                                    >
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
                                            stroke-dasharray="{activeDaysPercent *
                                                3.27} 327"
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
                                            >{appStore.stats?.activeDays ??
                                                0}</text
                                        >
                                    </svg>
                                </div>
                                <div
                                    class="flex items-center gap-3 text-[var(--color-accent)]"
                                >
                                    <CalendarCheck
                                        class="w-8 h-8"
                                        weight="bold"
                                    />
                                    <span
                                        class="text-[28px] font-bold uppercase tracking-wider"
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
                                    <svg
                                        viewBox="0 0 120 120"
                                        class="w-full h-full"
                                    >
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
                                            >{appStore.stats?.longestStreak ??
                                                0}</text
                                        >
                                    </svg>
                                </div>
                                <div
                                    class="flex items-center gap-3 text-[#ff6b6b]"
                                >
                                    <Lightning class="w-8 h-8" weight="bold" />
                                    <span
                                        class="text-[28px] font-bold uppercase tracking-wider"
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
                    {/if}

                    <!-- Personal Records - Horizontal Grid (matching Dashboard) -->
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
                                    {@const record =
                                        appStore.records.longestDistance}
                                    <div class="record-card-compact">
                                        <div class="record-icon-compact">
                                            <Trophy
                                                class="w-14 h-14"
                                                weight="fill"
                                            />
                                        </div>
                                        <div
                                            class="text-[42px] font-black text-[var(--color-text-primary)] leading-tight whitespace-nowrap"
                                        >
                                            {formatDistance(
                                                record.value,
                                                appStore.unit,
                                            )}
                                        </div>
                                        <div
                                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest opacity-80 whitespace-nowrap"
                                        >
                                            Longest Distance
                                        </div>
                                        <div
                                            class="text-[16px] text-[var(--color-accent)] mt-2 font-medium truncate w-full"
                                        >
                                            {record.activity.title}
                                        </div>
                                    </div>
                                {/if}
                                {#if appStore.records.longestDuration}
                                    {@const record =
                                        appStore.records.longestDuration}
                                    <div class="record-card-compact">
                                        <div class="record-icon-compact">
                                            <Hourglass
                                                class="w-14 h-14"
                                                weight="fill"
                                            />
                                        </div>
                                        <div
                                            class="text-[42px] font-black text-[var(--color-text-primary)] leading-tight whitespace-nowrap"
                                        >
                                            {formatDuration(record.value)}
                                        </div>
                                        <div
                                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest opacity-80 whitespace-nowrap"
                                        >
                                            Longest Duration
                                        </div>
                                        <div
                                            class="text-[16px] text-[var(--color-accent)] mt-2 font-medium truncate w-full"
                                        >
                                            {record.activity.title}
                                        </div>
                                    </div>
                                {/if}
                                {#if appStore.records.biggestBurn}
                                    {@const record =
                                        appStore.records.biggestBurn}
                                    <div class="record-card-compact">
                                        <div class="record-icon-compact">
                                            <Fire
                                                class="w-14 h-14"
                                                weight="fill"
                                            />
                                        </div>
                                        <div
                                            class="text-[42px] font-black text-[var(--color-text-primary)] leading-tight whitespace-nowrap"
                                        >
                                            {formatCalories(record.value)}
                                        </div>
                                        <div
                                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest opacity-80 whitespace-nowrap"
                                        >
                                            Biggest Burn
                                        </div>
                                        <div
                                            class="text-[16px] text-[var(--color-accent)] mt-2 font-medium truncate w-full"
                                        >
                                            {record.activity.title}
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    <!-- Watermark (matching summary) -->
                    <div class="mt-auto pt-8 text-center">
                        <p
                            class="text-[24px] text-[var(--color-text-dim)] font-medium tracking-widest opacity-80"
                        >
                            activeyear.app
                        </p>
                    </div>
                {:else if variant === "highlights"}
                    <!-- ======================== -->
                    <!-- HIGHLIGHTS CARD VARIANT  -->
                    <!-- ======================== -->

                    <!-- Header with Username -->
                    <header class="text-center mb-[80px] relative">
                        {#if appStore.userName}
                            <p
                                class="text-[42px] font-bold text-[var(--color-accent)] mb-2 relative z-10 leading-none uppercase tracking-widest mr-[-0.1em]"
                            >
                                {appStore.userName}'s
                            </p>
                        {/if}
                        <div class="flex flex-col items-center justify-center">
                            <h2
                                class="text-[140px] font-black text-[var(--color-text-primary)] leading-[0.8] mb-2 tracking-tighter mr-[0.05em]"
                            >
                                2025
                            </h2>
                            <h1
                                class="text-[72px] font-bold tracking-[0.15em] export-title leading-none relative z-10 uppercase text-[var(--color-text-dim)] mr-[-0.15em]"
                            >
                                HIGHLIGHTS
                            </h1>
                        </div>
                    </header>

                    {@const highlights = appStore.highlights.slice(0, 10)}
                    {@const hasMany = highlights.length > 5}

                    <!-- Heart Icon (Smaller if many items) -->
                    <div
                        class="flex justify-center {hasMany
                            ? 'mb-12'
                            : 'mb-20'}"
                    >
                        <div
                            class="{hasMany
                                ? 'w-24 h-24'
                                : 'w-42 h-42'} rounded-full flex items-center justify-center bg-[var(--color-accent)]/10"
                        >
                            <Heart
                                class="{hasMany
                                    ? 'w-14 h-14'
                                    : 'w-24 h-24'} text-red-400"
                                weight="fill"
                            />
                        </div>
                    </div>

                    <!-- Highlights List (Responsive Grid) -->
                    <div class="flex-1 flex flex-col justify-center px-4 mb-20">
                        {#if highlights.length === 0}
                            <div
                                class="text-center text-[var(--color-text-muted)] text-[28px]"
                            >
                                No highlight activities yet
                            </div>
                        {:else}
                            <div
                                class="grid {highlights.length > 5
                                    ? 'grid-cols-2'
                                    : 'grid-cols-1'} gap-6"
                            >
                                {#each highlights as fav}
                                    {@const IconComponent =
                                        sportIcons[fav.type] ?? Target}
                                    <div
                                        class="flex items-center gap-5 p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/5"
                                    >
                                        <div
                                            class="w-14 h-14 rounded-xl flex items-center justify-center bg-[var(--color-accent)]/20 text-[var(--color-accent)] shrink-0"
                                        >
                                            <IconComponent
                                                class="w-7 h-7"
                                                weight="bold"
                                            />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div
                                                class="flex items-center gap-2 mb-1"
                                            >
                                                <Heart
                                                    class="w-4 h-4 text-red-400 shrink-0"
                                                    weight="fill"
                                                />
                                                <span
                                                    class="text-[24px] font-bold text-[var(--color-text-primary)] truncate"
                                                >
                                                    {fav.title ||
                                                        sportNames[fav.type] ||
                                                        "Activity"}
                                                </span>
                                            </div>
                                            <div
                                                class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[18px] text-[var(--color-text-muted)]"
                                            >
                                                {#if fav.distance > 0}
                                                    <span class="font-mono">
                                                        {formatDistance(
                                                            fav.distance,
                                                            appStore.unit,
                                                        )}
                                                    </span>
                                                {/if}
                                                <span class="font-mono">
                                                    {formatDuration(
                                                        fav.duration,
                                                    )}
                                                </span>
                                                <span
                                                    class="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[14px] uppercase tracking-wider text-[var(--color-accent)]"
                                                >
                                                    {sportNames[fav.type] ??
                                                        fav.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>

                            {#if appStore.highlights.length > 10}
                                <div
                                    class="text-center text-[var(--color-text-muted)] text-[22px] mt-8"
                                >
                                    +{appStore.highlights.length - 10} more highlights
                                </div>
                            {/if}
                        {/if}
                    </div>

                    <!-- Watermark -->
                    <div class="mt-auto pt-8 text-center">
                        <p
                            class="text-[24px] text-[var(--color-text-dim)] font-medium tracking-widest opacity-80"
                        >
                            activeyear.app
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .export-card-wrapper {
        margin-left: auto;
        margin-right: auto;
    }

    .export-card {
        background: var(--color-surface);
        position: relative;
        overflow: hidden;
        font-family: "Outfit", system-ui, sans-serif;
    }

    /* Background styles per theme */
    .export-background {
        background: var(--color-surface);
    }

    .theme-neon .export-background {
        background: radial-gradient(circle at 50% 0%, #1a1b26 0%, #050505 100%);
    }

    .theme-minimalist .export-background {
        background: #fdfdfd;
    }

    .theme-retro .export-background {
        background: linear-gradient(135deg, #2e2660 0%, #1e1b4b 100%);
    }

    /* Typography Overrides */
    .theme-neon .export-title {
        text-shadow: 0 0 40px var(--color-accent-glow);
        color: var(--color-text-primary);
    }

    .theme-minimalist .export-title {
        color: #000;
        letter-spacing: -0.05em;
    }

    .theme-minimalist .stat-value {
        color: #000 !important;
    }

    .theme-minimalist .text-\[var\(--color-text-primary\)\] {
        color: #111 !important;
    }

    .theme-minimalist .text-\[var\(--color-text-muted\)\] {
        color: #666 !important;
    }

    .theme-minimalist .text-\[var\(--color-text-dim\)\] {
        color: #999 !important;
    }

    .theme-retro .export-title {
        text-shadow: 3px 3px 0px var(--color-accent-dim);
        font-style: italic;
    }

    .stat-value {
        font-feature-settings: "tnum";
        font-variant-numeric: tabular-nums;
    }

    /* Avatar Container */
    .avatar-container {
        width: 400px;
        height: 400px;
        border-radius: 9999px;
        background: var(--color-surface-elevated);
        border: 4px solid var(--color-accent);
        box-shadow: 0 0 30px var(--color-accent-glow);
        padding: 4px;
        overflow: hidden;
        position: relative;
        z-index: 20;
    }

    .theme-minimalist .avatar-container {
        background: #fff;
        border: 4px solid #000;
        box-shadow: none;
    }

    .theme-retro .avatar-container {
        background: #2e2660;
        border: 6px solid #ff00cc;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.3);
        border-radius: 20%; /* More square for retro */
    }

    .theme-retro .avatar-container img {
        border-radius: 8%;
    }

    /* Avatar Decorations & Spirals */
    .avatar-decorations {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .spiral-svg {
        width: 650px;
        height: 650px;
        overflow: visible;
        transform: rotate(-15deg);
        flex-shrink: 0;
    }

    .spiral-path {
        fill: none;
        stroke: var(--color-accent);
        stroke-linecap: round;
        opacity: 0.3;
        transition: stroke 0.3s ease;
    }

    .spiral-path-1 {
        stroke-width: 1.5;
        stroke-dasharray: 200 100;
        opacity: 0.4;
    }

    .spiral-path-2 {
        stroke-width: 1;
        stroke-dasharray: 150 150;
        opacity: 0.25;
    }

    .spiral-path-3 {
        stroke-width: 0.8;
        stroke-dasharray: 100 200;
        opacity: 0.2;
    }

    .spiral-path-accent {
        fill: none;
        stroke: var(--color-accent);
        stroke-width: 0.5;
    }

    /* Theme-specific tweaks for decorations */
    .theme-minimalist .avatar-decorations {
        opacity: 0.85;
    }

    .theme-retro .spiral-svg {
        width: 550px;
        height: 550px;
    }

    /* Donut Chart */
    .donut-chart-container {
        width: 360px;
        height: 360px;
        position: relative;
    }

    .donut-chart {
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .donut-segment {
        transition: stroke-dasharray 0.3s ease;
    }

    .progress-ring {
        filter: drop-shadow(0 0 10px var(--color-accent-glow));
    }

    .streak-ring {
        filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.4));
    }

    /* Record Cards */

    .theme-minimalist .donut-segment {
        filter: none !important;
    }

    .theme-minimalist .progress-ring {
        stroke: #000 !important;
        filter: none;
    }

    .theme-minimalist .streak-ring {
        stroke: #666 !important;
        filter: none;
    }

    .theme-retro .donut-segment {
        filter: drop-shadow(0 0 12px var(--color-accent)) !important;
    }

    /* Compact Record Cards (Horizontal Layout) */
    .record-card-compact {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 20px 12px;
        background: transparent;
        border-radius: 16px;
        border: none;
    }

    .record-icon-compact {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-gold);
        margin-bottom: 12px;
        background: transparent;
        border: none;
        box-shadow: none;
    }

    .theme-minimalist .record-card-compact,
    .theme-minimalist .record-icon-compact {
        background: transparent;
        border: none;
        box-shadow: none;
    }

    /* Theme-specific background/stroke overrides */
    .theme-neon .donut-bg,
    .theme-retro .donut-bg {
        stroke: rgba(255, 255, 255, 0.05);
    }

    .theme-neon .sport-bar-bg,
    .theme-retro .sport-bar-bg {
        background-color: rgba(255, 255, 255, 0.05) !important;
    }

    .theme-neon .progress-ring-bg,
    .theme-retro .progress-ring-bg {
        stroke: rgba(255, 255, 255, 0.08);
    }

    .theme-neon .consistency-card,
    .theme-retro .consistency-card,
    .theme-minimalist .consistency-card {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
    }
</style>
