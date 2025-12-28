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
    let topSports = $derived(appStore.breakdown.slice(0, 4));

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
    let maxSportCount = $derived(Math.max(...topSports.map((s) => s.count), 1));
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
            <div class="relative z-10 h-full flex flex-col p-[5%]">
                {#if variant === "summary"}
                    <!-- ===================== -->
                    <!-- SUMMARY CARD VARIANT -->
                    <!-- ===================== -->

                    <!-- Header -->
                    <header class="text-center mb-8">
                        {#if appStore.userName}
                            <p
                                class="text-[48px] font-medium text-[var(--color-text-muted)] mb-2"
                            >
                                {appStore.userName}'s
                            </p>
                        {/if}
                        <h1
                            class="text-[140px] font-bold tracking-tight export-title leading-none mb-2"
                        >
                            2025
                        </h1>
                        <p
                            class="text-[36px] text-[var(--color-text-dim)] font-medium tracking-wide uppercase"
                        >
                            Year in Sport
                        </p>
                    </header>

                    <!-- Hero Stat: Featured Metric with Fun Equivalent -->
                    <div
                        class="flex-1 flex flex-col justify-center items-center text-center gap-8"
                    >
                        <!-- Distance Hero -->
                        <div class="hero-stat-block">
                            <div
                                class="flex items-center justify-center gap-4 mb-4 text-[var(--color-accent)]"
                            >
                                <Ruler class="w-16 h-16" strokeWidth={1.5} />
                            </div>
                            <div
                                class="text-[120px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                            >
                                {formatDistance(
                                    appStore.stats?.totalDistance ?? 0,
                                )}
                            </div>
                            <div
                                class="text-[28px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-2"
                            >
                                Total Distance
                            </div>
                            <div
                                class="text-[36px] font-semibold text-[var(--color-accent)] mt-4"
                            >
                                🌍 {formatEarthLaps(
                                    appStore.stats?.totalDistance ?? 0,
                                )}
                            </div>
                        </div>

                        <!-- Supporting Stats Row -->
                        <div class="grid grid-cols-3 gap-6 w-full mt-8">
                            <!-- Elevation -->
                            <div class="summary-stat-card">
                                <Mountain
                                    class="w-10 h-10 text-[var(--color-accent)] mb-3 mx-auto"
                                    strokeWidth={1.5}
                                />
                                <div
                                    class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                                >
                                    {formatElevation(
                                        appStore.stats?.totalElevation ?? 0,
                                    )}
                                </div>
                                <div
                                    class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-wide mt-1"
                                >
                                    Elevation
                                </div>
                                <div
                                    class="text-[20px] text-[var(--color-accent)] mt-2"
                                >
                                    🏔️ {formatEverests(
                                        appStore.stats?.totalElevation ?? 0,
                                    )}
                                </div>
                            </div>

                            <!-- Time -->
                            <div class="summary-stat-card">
                                <Timer
                                    class="w-10 h-10 text-[var(--color-accent)] mb-3 mx-auto"
                                    strokeWidth={1.5}
                                />
                                <div
                                    class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                                >
                                    {formatDuration(
                                        appStore.stats?.totalDuration ?? 0,
                                    )}
                                </div>
                                <div
                                    class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-wide mt-1"
                                >
                                    Time Active
                                </div>
                                <div
                                    class="text-[20px] text-[var(--color-accent)] mt-2"
                                >
                                    💍 {formatLotRMarathons(
                                        appStore.stats?.totalDuration ?? 0,
                                    )}
                                </div>
                            </div>

                            <!-- Calories -->
                            <div class="summary-stat-card">
                                <Flame
                                    class="w-10 h-10 text-[var(--color-accent)] mb-3 mx-auto"
                                    strokeWidth={1.5}
                                />
                                <div
                                    class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                                >
                                    {formatCalories(
                                        appStore.stats?.totalCalories ?? 0,
                                    )}
                                </div>
                                <div
                                    class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-wide mt-1"
                                >
                                    Calories
                                </div>
                                <div
                                    class="text-[20px] text-[var(--color-accent)] mt-2"
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
                            class="text-[24px] text-[var(--color-text-dim)] font-medium"
                        >
                            activeyear.app
                        </p>
                    </div>
                {:else}
                    <!-- ======================== -->
                    <!-- BREAKDOWN CARD VARIANT -->
                    <!-- ======================== -->

                    <!-- Header -->
                    <header class="text-center mb-8">
                        <h1
                            class="text-[72px] font-bold tracking-tight export-title leading-none mb-2"
                        >
                            Activity Breakdown
                        </h1>
                        <p
                            class="text-[28px] text-[var(--color-text-dim)] font-medium tracking-wide"
                        >
                            {appStore.userName
                                ? `${appStore.userName}'s `
                                : ""}2025 Year in Sport
                        </p>
                    </header>

                    <!-- Sport Breakdown with Horizontal Bars -->
                    {#if topSports.length > 0}
                        <div class="mb-10">
                            <h2
                                class="text-[32px] font-semibold text-[var(--color-text-muted)] mb-6 uppercase tracking-wider"
                            >
                                Top Activities
                            </h2>
                            <div class="space-y-4">
                                {#each topSports as sport, i}
                                    {@const IconComponent =
                                        sportIcons[sport.type] ?? Target}
                                    {@const barWidth =
                                        (sport.count / maxSportCount) * 100}
                                    <div class="sport-bar-row">
                                        <div
                                            class="flex items-center gap-4 w-48"
                                        >
                                            <IconComponent
                                                class="w-8 h-8 text-[var(--color-accent)]"
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                class="text-[24px] font-medium text-[var(--color-text-primary)]"
                                            >
                                                {sportNames[sport.type] ??
                                                    sport.type}
                                            </span>
                                        </div>
                                        <div
                                            class="flex-1 h-12 rounded-lg bg-[var(--color-accent-subtle)] overflow-hidden"
                                        >
                                            <div
                                                class="h-full sport-bar-fill rounded-lg"
                                                style="width: {barWidth}%;"
                                            ></div>
                                        </div>
                                        <div class="w-24 text-right">
                                            <span
                                                class="text-[28px] font-bold stat-value text-[var(--color-text-primary)]"
                                            >
                                                {sport.count}
                                            </span>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Consistency Stats -->
                    <div class="grid grid-cols-2 gap-8 mb-10">
                        <div class="breakdown-stat-card">
                            <div
                                class="flex items-center gap-4 mb-4 text-[var(--color-accent)]"
                            >
                                <CalendarCheck
                                    class="w-14 h-14"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div
                                class="text-[96px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                            >
                                {appStore.stats?.activeDays ?? 0}
                            </div>
                            <div
                                class="text-[24px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-2"
                            >
                                Active Days
                            </div>
                        </div>
                        <div class="breakdown-stat-card">
                            <div
                                class="flex items-center gap-4 mb-4 text-[var(--color-accent)]"
                            >
                                <Zap class="w-14 h-14" strokeWidth={1.5} />
                            </div>
                            <div
                                class="text-[96px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                            >
                                {appStore.stats?.longestStreak ?? 0}
                            </div>
                            <div
                                class="text-[24px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-2"
                            >
                                Day Streak
                            </div>
                        </div>
                    </div>

                    <!-- Personal Records -->
                    {#if appStore.records}
                        <div class="mb-auto">
                            <h2
                                class="text-[32px] font-semibold text-[var(--color-text-muted)] mb-6 uppercase tracking-wider"
                            >
                                Personal Records
                            </h2>
                            <div class="grid grid-cols-3 gap-6">
                                {#if appStore.records.longestDistance}
                                    <div class="record-card">
                                        <Trophy
                                            class="w-12 h-12 text-amber-400 mb-3 mx-auto"
                                            strokeWidth={1.5}
                                        />
                                        <div
                                            class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none mb-1"
                                        >
                                            {formatDistance(
                                                appStore.records.longestDistance
                                                    .value,
                                            )}
                                        </div>
                                        <div
                                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-wide"
                                        >
                                            Longest
                                        </div>
                                    </div>
                                {/if}
                                {#if appStore.records.longestDuration}
                                    <div class="record-card">
                                        <Hourglass
                                            class="w-12 h-12 text-amber-400 mb-3 mx-auto"
                                            strokeWidth={1.5}
                                        />
                                        <div
                                            class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none mb-1"
                                        >
                                            {formatDuration(
                                                appStore.records.longestDuration
                                                    .value,
                                            )}
                                        </div>
                                        <div
                                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-wide"
                                        >
                                            Duration
                                        </div>
                                    </div>
                                {/if}
                                {#if appStore.records.biggestBurn}
                                    <div class="record-card">
                                        <Sparkles
                                            class="w-12 h-12 text-amber-400 mb-3 mx-auto"
                                            strokeWidth={1.5}
                                        />
                                        <div
                                            class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none mb-1"
                                        >
                                            {formatCalories(
                                                appStore.records.biggestBurn
                                                    .value,
                                            )}
                                        </div>
                                        <div
                                            class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-wide"
                                        >
                                            Burn
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    <!-- Watermark -->
                    <div class="mt-auto pt-6 text-center">
                        <p
                            class="text-[24px] text-[var(--color-text-dim)] font-medium"
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
        background: linear-gradient(to bottom, #0f1014, #0a0a0b);
    }

    .theme-minimalist .export-background {
        background: var(--color-surface);
    }

    .theme-retro .export-background {
        background: linear-gradient(135deg, #1e1b4b 0%, #2e2660 100%);
    }

    /* Title glow for Neon theme */
    .theme-neon .export-title {
        text-shadow: 0 0 30px var(--color-accent-glow);
        color: var(--color-text-primary);
    }

    .theme-minimalist .export-title,
    .theme-retro .export-title {
        color: var(--color-text-primary);
    }

    /* Retro title has subtle glow */
    .theme-retro .export-title {
        text-shadow: 0 0 20px var(--color-accent-glow);
    }

    .stat-value {
        font-family: "JetBrains Mono", monospace;
        letter-spacing: -0.02em;
    }

    /* ============== */
    /* SUMMARY STYLES */
    /* ============== */

    .hero-stat-block {
        padding: 3rem;
        border-radius: 2rem;
        background: var(--color-accent-subtle);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .theme-neon .hero-stat-block {
        box-shadow: 0 0 40px var(--color-accent-glow);
    }

    .theme-minimalist .hero-stat-block {
        background: rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 1rem;
    }

    .theme-retro .hero-stat-block {
        border: 4px solid var(--color-accent);
        border-radius: 0;
    }

    .summary-stat-card {
        background: var(--color-accent-subtle);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 1.5rem;
        padding: 1.5rem;
        text-align: center;
    }

    .theme-minimalist .summary-stat-card {
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 0.75rem;
    }

    .theme-retro .summary-stat-card {
        border: 3px solid var(--color-accent);
        border-radius: 0;
    }

    /* ================ */
    /* BREAKDOWN STYLES */
    /* ================ */

    .sport-bar-row {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .sport-bar-fill {
        background: linear-gradient(
            90deg,
            var(--color-accent),
            var(--color-accent-glow)
        );
        transition: width 0.5s ease-out;
    }

    .theme-minimalist .sport-bar-fill {
        background: var(--color-accent);
    }

    .theme-retro .sport-bar-fill {
        background: var(--color-accent);
        border-radius: 0;
    }

    .breakdown-stat-card {
        background: var(--color-accent-subtle);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1.5rem;
        padding: 2rem;
    }

    .theme-neon .breakdown-stat-card {
        box-shadow: 0 0 20px var(--color-accent-glow);
    }

    .theme-minimalist .breakdown-stat-card {
        background: rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 0.75rem;
    }

    .theme-retro .breakdown-stat-card {
        border: 4px solid var(--color-accent);
        border-radius: 0;
    }

    .record-card {
        background: var(--color-accent-subtle);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 1.25rem;
        padding: 1.5rem;
        text-align: center;
    }

    .theme-minimalist .record-card {
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .theme-retro .record-card {
        border: 3px solid var(--color-accent);
        border-radius: 0;
    }
</style>
