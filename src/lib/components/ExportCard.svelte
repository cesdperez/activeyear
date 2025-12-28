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

    // Lucide icons
    import {
        Ruler,
        Timer,
        CalendarCheck,
        Zap,
        Trophy,
        Hourglass,
        Sparkles,
        Footprints,
        Bike,
        Waves,
        Mountain,
        Dumbbell,
        Heart,
        Target,
        Flame,
    } from "@lucide/svelte";

    // Sport icons mapping
    const sportIcons: Record<string, typeof Footprints> = {
        running: Footprints,
        cycling: Bike,
        swimming: Waves,
        walking: Footprints,
        hiking: Mountain,
        strength: Dumbbell,
        yoga: Heart,
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

    // Fixed scale factor for preview (show smaller version)
    const scale = 0.35;

    // Top 4 sports for the card
    let topSports = $derived(
        [...appStore.breakdown]
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
                                class="text-[42px] font-bold text-[var(--color-accent)] mb-2 relative z-10 leading-none uppercase tracking-widest"
                            >
                                {appStore.userName}'s
                            </p>
                        {/if}
                        <div class="flex flex-col items-center justify-center">
                            <h2
                                class="text-[140px] font-black text-[var(--color-text-primary)] leading-[0.8] mb-2 tracking-tighter"
                            >
                                2025
                            </h2>
                            <h1
                                class="text-[72px] font-bold tracking-[0.15em] export-title leading-none relative z-10 uppercase text-[var(--color-text-dim)]"
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
                                    class="spiral-path spiral-path-1"
                                    transform="rotate(-30 100 100)"
                                />
                                <ellipse
                                    cx="100"
                                    cy="100"
                                    rx="90"
                                    ry="30"
                                    class="spiral-path spiral-path-2"
                                    transform="rotate(45 100 100)"
                                />
                                <ellipse
                                    cx="100"
                                    cy="100"
                                    rx="95"
                                    ry="40"
                                    class="spiral-path spiral-path-3"
                                    transform="rotate(120 100 100)"
                                />

                                <!-- Concentric Accents -->
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="78"
                                    class="spiral-path-accent"
                                    stroke-dasharray="10 20"
                                />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="82"
                                    class="spiral-path-accent"
                                    stroke-dasharray="5 15"
                                    opacity="0.3"
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
                                    <TopIcon
                                        class="w-56 h-56"
                                        strokeWidth={2.5}
                                    />
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
                            ),
                            icon: Ruler,
                            equivalent: `🌍 ${formatEarthLaps(appStore.stats?.totalDistance ?? 0)}`,
                        },
                        {
                            id: "elevation",
                            label: "Elevation",
                            value: formatElevation(
                                appStore.stats?.totalElevation ?? 0,
                            ),
                            icon: Mountain,
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
                            icon: Flame,
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
                                    strokeWidth={2.5}
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
                                        strokeWidth={2}
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
                    <div
                        class="mt-auto pt-8 text-center bg-gradient-to-t from-[var(--color-surface)] to-transparent"
                    >
                        <p
                            class="text-[24px] text-[var(--color-text-dim)] font-medium tracking-widest opacity-80"
                        >
                            activeyear.app
                        </p>
                    </div>
                {:else}
                    <!-- ======================== -->
                    <!-- BREAKDOWN CARD VARIANT -->
                    <!-- ======================== -->

                    <!-- Header -->
                    <header
                        class="text-left mb-10 pl-2 border-l-4 border-[var(--color-accent)]"
                    >
                        <h1
                            class="text-[64px] font-bold tracking-tight export-title leading-none mb-1"
                        >
                            BREAKDOWN
                        </h1>
                        <p
                            class="text-[28px] text-[var(--color-text-muted)] font-medium tracking-wide"
                        >
                            2025 ACTIVITY LOG
                        </p>
                    </header>

                    <!-- Sport Breakdown with Modern Bars -->
                    {#if topSports.length > 0}
                        <div class="mb-12">
                            <div class="space-y-6">
                                {#each topSports as sport, i}
                                    {@const IconComponent =
                                        sportIcons[sport.type] ?? Target}
                                    {@const barWidth =
                                        (sport[appStore.breakdownMetric] /
                                            maxSportCount) *
                                        100}
                                    <div class="relative">
                                        <!-- Label Row -->
                                        <div
                                            class="flex items-end justify-between mb-2 px-1"
                                        >
                                            <div
                                                class="flex items-center gap-3"
                                            >
                                                <IconComponent
                                                    class="w-6 h-6 text-[var(--color-accent)]"
                                                    strokeWidth={2}
                                                />
                                                <span
                                                    class="text-[24px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide"
                                                >
                                                    {sportNames[sport.type] ??
                                                        sport.type}
                                                </span>
                                            </div>
                                            <span
                                                class="text-[24px] font-mono font-bold text-[var(--color-text-primary)]"
                                            >
                                                {appStore.breakdownMetric ===
                                                "count"
                                                    ? sport.count
                                                    : formatDuration(
                                                          sport.duration,
                                                      )}
                                            </span>
                                        </div>

                                        <!-- Bar -->
                                        <div
                                            class="h-4 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden"
                                        >
                                            <div
                                                class="h-full sport-bar-fill rounded-full"
                                                style="width: {barWidth}%;"
                                            ></div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Consistency Stats - Big Numbers -->
                    <div class="grid grid-cols-2 gap-8 mb-12">
                        <div class="text-left">
                            <div
                                class="text-[80px] font-bold stat-value text-[var(--color-text-primary)] leading-none -tracking-wider"
                            >
                                {appStore.stats?.activeDays ?? 0}
                            </div>
                            <div
                                class="flex items-center gap-2 text-[var(--color-accent)] mt-1"
                            >
                                <CalendarCheck
                                    class="w-6 h-6"
                                    strokeWidth={2}
                                />
                                <span
                                    class="text-[20px] font-bold uppercase tracking-wider"
                                    >Active Days</span
                                >
                            </div>
                        </div>
                        <div class="text-left">
                            <div
                                class="text-[80px] font-bold stat-value text-[var(--color-text-primary)] leading-none -tracking-wider"
                            >
                                {appStore.stats?.longestStreak ?? 0}
                            </div>
                            <div
                                class="flex items-center gap-2 text-[var(--color-accent)] mt-1"
                            >
                                <Zap class="w-6 h-6" strokeWidth={2} />
                                <span
                                    class="text-[20px] font-bold uppercase tracking-wider"
                                    >Day Streak</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Personal Records - Minimal List -->
                    {#if appStore.records}
                        <div
                            class="mb-auto mt-4 px-4 py-6 bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(255,255,255,0.05)]"
                        >
                            <div class="flex justify-between items-center mb-6">
                                <h2
                                    class="text-[20px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest"
                                >
                                    Personal Bests
                                </h2>
                                <Trophy class="w-6 h-6 text-amber-400" />
                            </div>

                            <div class="space-y-6">
                                {#if appStore.records.longestDistance}
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center"
                                            >
                                                <Trophy
                                                    class="w-4 h-4 text-[var(--color-text-dim)]"
                                                />
                                            </div>
                                            <span
                                                class="text-[20px] text-[var(--color-text-primary)] font-medium"
                                                >Longest Distance</span
                                            >
                                        </div>
                                        <span
                                            class="text-[24px] font-bold font-mono text-[var(--color-text-primary)]"
                                        >
                                            {formatDistance(
                                                appStore.records.longestDistance
                                                    .value,
                                            )}
                                        </span>
                                    </div>
                                {/if}
                                {#if appStore.records.longestDuration}
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center"
                                            >
                                                <Hourglass
                                                    class="w-4 h-4 text-[var(--color-text-dim)]"
                                                />
                                            </div>
                                            <span
                                                class="text-[20px] text-[var(--color-text-primary)] font-medium"
                                                >Duration</span
                                            >
                                        </div>
                                        <span
                                            class="text-[24px] font-bold font-mono text-[var(--color-text-primary)]"
                                        >
                                            {formatDuration(
                                                appStore.records.longestDuration
                                                    .value,
                                            )}
                                        </span>
                                    </div>
                                {/if}
                                {#if appStore.records.biggestBurn}
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center"
                                            >
                                                <Flame
                                                    class="w-4 h-4 text-[var(--color-text-dim)]"
                                                />
                                            </div>
                                            <span
                                                class="text-[20px] text-[var(--color-text-primary)] font-medium"
                                                >Biggest Burn</span
                                            >
                                        </div>
                                        <span
                                            class="text-[24px] font-bold font-mono text-[var(--color-text-primary)]"
                                        >
                                            {formatCalories(
                                                appStore.records.biggestBurn
                                                    .value,
                                            )}
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    <!-- Watermark -->
                    <div class="mt-auto pt-6 text-center">
                        <p
                            class="text-[20px] text-[var(--color-text-dim)] font-medium tracking-wide"
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

    /* Progress Bar */
    .sport-bar-fill {
        background: var(--color-accent);
        box-shadow: 0 0 15px var(--color-accent-glow);
    }

    .theme-minimalist .sport-bar-fill {
        background: #000;
        box-shadow: none;
    }

    .theme-retro .sport-bar-fill {
        background: linear-gradient(90deg, #ff00cc, #3333ff);
        box-shadow: none;
        border-radius: 0;
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
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 650px;
        height: 650px;
        pointer-events: none;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .spiral-svg {
        width: 100%;
        height: 100%;
        overflow: visible;
        transform: rotate(-15deg);
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

    .theme-minimalist .spiral-path {
        stroke: #555;
        stroke-width: 1.6;
        stroke-dasharray: none;
    }

    .theme-retro .avatar-decorations {
        width: 550px;
        height: 550px;
    }

    .theme-retro .spiral-path {
        stroke: #ff00cc;
        stroke-width: 3;
        stroke-dasharray: 20 10;
        opacity: 0.5;
    }

    .theme-retro .spiral-path-accent {
        stroke: #3333ff;
        stroke-width: 2;
    }
</style>
