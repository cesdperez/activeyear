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
            <div class="relative z-10 h-full flex flex-col p-8">
                {#if variant === "summary"}
                    <!-- ===================== -->
                    <!-- SUMMARY CARD VARIANT -->
                    <!-- ===================== -->

                    <!-- Header -->
                    <header class="text-center mb-8 relative">
                        <!-- Massive Watermark Year -->
                        <div
                            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[280px] font-bold text-[var(--color-text-primary)] opacity-[0.03] pointer-events-none select-none leading-none z-0"
                        >
                            2025
                        </div>

                        {#if appStore.userName}
                            <p
                                class="text-[32px] font-medium text-[var(--color-text-muted)] mb-1 relative z-10"
                            >
                                {appStore.userName}'s
                            </p>
                        {/if}
                        <h1
                            class="text-[72px] font-bold tracking-tight export-title leading-none relative z-10"
                        >
                            YEAR IN SPORT
                        </h1>
                    </header>

                    <!-- Hero Stat: Featured Metric with Fun Equivalent -->
                    <div
                        class="flex-1 flex flex-col justify-center items-center text-center gap-2"
                    >
                        <!-- Distance Hero - Floating -->
                        <div class="mb-4">
                            <div
                                class="flex items-center justify-center gap-3 mb-2 text-[var(--color-accent)]"
                            >
                                <Ruler class="w-12 h-12" strokeWidth={2} />
                            </div>
                            <div
                                class="text-[140px] font-bold stat-value text-[var(--color-text-primary)] leading-none -tracking-[0.04em]"
                            >
                                {formatDistance(
                                    appStore.stats?.totalDistance ?? 0,
                                )}
                            </div>
                            <div
                                class="text-[24px] font-medium text-[var(--color-text-dim)] uppercase tracking-widest mt-2"
                            >
                                Total Distance
                            </div>
                            <div
                                class="text-[32px] font-semibold text-[var(--color-accent)] mt-4"
                            >
                                🌍 {formatEarthLaps(
                                    appStore.stats?.totalDistance ?? 0,
                                )}
                            </div>
                        </div>

                        <!-- Separator -->
                        <div
                            class="w-24 h-1 bg-[var(--color-accent)] opacity-30 rounded-full my-6"
                        ></div>

                        <!-- Supporting Stats Row - Clean Grid -->
                        <div class="grid grid-cols-3 gap-4 w-full px-2">
                            <!-- Elevation -->
                            <div class="text-center">
                                <Mountain
                                    class="w-8 h-8 text-[var(--color-text-dim)] mb-2 mx-auto"
                                    strokeWidth={2}
                                />
                                <div
                                    class="text-[42px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                                >
                                    {formatElevation(
                                        appStore.stats?.totalElevation ?? 0,
                                    )}
                                </div>
                                <div
                                    class="text-[14px] text-[var(--color-text-muted)] uppercase tracking-wide mt-1"
                                >
                                    Elevation
                                </div>
                                <div
                                    class="text-[16px] text-[var(--color-accent)] mt-1 font-medium"
                                >
                                    🏔️ {formatEverests(
                                        appStore.stats?.totalElevation ?? 0,
                                    )}
                                </div>
                            </div>

                            <!-- Time -->
                            <div
                                class="text-center border-l border-r border-white/5"
                            >
                                <Timer
                                    class="w-8 h-8 text-[var(--color-text-dim)] mb-2 mx-auto"
                                    strokeWidth={2}
                                />
                                <div
                                    class="text-[42px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                                >
                                    {formatDuration(
                                        appStore.stats?.totalDuration ?? 0,
                                    )}
                                </div>
                                <div
                                    class="text-[14px] text-[var(--color-text-muted)] uppercase tracking-wide mt-1"
                                >
                                    Time Active
                                </div>
                                <div
                                    class="text-[16px] text-[var(--color-accent)] mt-1 font-medium"
                                >
                                    💍 {formatLotRMarathons(
                                        appStore.stats?.totalDuration ?? 0,
                                    )}
                                </div>
                            </div>

                            <!-- Calories -->
                            <div class="text-center">
                                <Flame
                                    class="w-8 h-8 text-[var(--color-text-dim)] mb-2 mx-auto"
                                    strokeWidth={2}
                                />
                                <div
                                    class="text-[42px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                                >
                                    {formatCalories(
                                        appStore.stats?.totalCalories ?? 0,
                                    )}
                                </div>
                                <div
                                    class="text-[14px] text-[var(--color-text-muted)] uppercase tracking-wide mt-1"
                                >
                                    Calories
                                </div>
                                <div
                                    class="text-[16px] text-[var(--color-accent)] mt-1 font-medium"
                                >
                                    🍕 {formatPizzaSlices(
                                        appStore.stats?.totalCalories ?? 0,
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Watermark -->
                    <div class="mt-auto pt-6 text-center">
                        <p
                            class="text-[20px] text-[var(--color-text-dim)] font-medium tracking-wide"
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
</style>
