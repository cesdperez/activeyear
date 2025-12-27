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
    } from "$lib/utils/format.js";
    import { getExportDimensions } from "$lib/utils/export.js";

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

    // Get dimensions based on aspect ratio
    let dimensions = $derived(getExportDimensions(appStore.aspectRatio));

    // Scale factor for preview (show smaller version)
    let scale = $derived(
        appStore.aspectRatio === "9:16"
            ? 0.35
            : appStore.aspectRatio === "4:5"
              ? 0.4
              : 0.45,
    );

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
</script>

<!-- Export Card Container -->
<div
    class="export-card-wrapper"
    style="--scale: {scale}; --width: {dimensions.width}px; --height: {dimensions.height}px;"
>
    <div
        class="export-card {themeClasses}"
        id="export-card"
        data-theme={currentTheme}
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
            <!-- Header -->
            <header class="text-center mb-auto">
                {#if appStore.userName}
                    <p
                        class="text-[28px] font-medium text-[var(--color-text-muted)] mb-2"
                    >
                        {appStore.userName}'s
                    </p>
                {/if}
                <h1 class="text-[64px] font-bold tracking-tight export-title">
                    2025
                </h1>
                <p class="text-[24px] text-[var(--color-text-dim)] font-medium">
                    Year in Sport
                </p>
            </header>

            <!-- Hero Stats -->
            <div class="grid grid-cols-2 gap-6 mb-8">
                <div class="export-stat-card">
                    <div
                        class="flex items-center gap-3 mb-2 text-[var(--color-accent)]"
                    >
                        <Ruler class="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div
                        class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                    >
                        {formatDistance(appStore.stats?.totalDistance ?? 0)}
                    </div>
                    <div
                        class="text-[18px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-1"
                    >
                        Total Distance
                    </div>
                </div>
                <div class="export-stat-card">
                    <div
                        class="flex items-center gap-3 mb-2 text-[var(--color-accent)]"
                    >
                        <Timer class="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div
                        class="text-[48px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                    >
                        {formatDuration(appStore.stats?.totalDuration ?? 0)}
                    </div>
                    <div
                        class="text-[18px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-1"
                    >
                        Time Active
                    </div>
                </div>
            </div>

            <!-- Consistency Stats -->
            <div class="grid grid-cols-2 gap-6 mb-8">
                <div class="export-stat-card highlight">
                    <div
                        class="flex items-center gap-3 mb-2 text-[var(--color-accent)]"
                    >
                        <CalendarCheck class="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <div
                        class="text-[56px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                    >
                        {appStore.stats?.activeDays ?? 0}
                    </div>
                    <div
                        class="text-[16px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-1"
                    >
                        Active Days
                    </div>
                </div>
                <div class="export-stat-card highlight">
                    <div
                        class="flex items-center gap-3 mb-2 text-[var(--color-accent)]"
                    >
                        <Zap class="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <div
                        class="text-[56px] font-bold stat-value text-[var(--color-text-primary)] leading-none"
                    >
                        {appStore.stats?.longestStreak ?? 0}
                    </div>
                    <div
                        class="text-[16px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-1"
                    >
                        Day Streak
                    </div>
                </div>
            </div>

            <!-- Personal Records -->
            {#if appStore.records}
                <div class="mb-8">
                    <h2
                        class="text-[20px] font-semibold text-[var(--color-text-muted)] mb-4 uppercase tracking-wider"
                    >
                        Personal Records
                    </h2>
                    <div class="grid grid-cols-3 gap-4">
                        {#if appStore.records.longestDistance}
                            <div class="export-record-card">
                                <Trophy
                                    class="w-6 h-6 text-amber-400 mb-2"
                                    strokeWidth={1.5}
                                />
                                <div
                                    class="text-[28px] font-bold stat-value text-[var(--color-text-primary)]"
                                >
                                    {formatDistance(
                                        appStore.records.longestDistance.value,
                                    )}
                                </div>
                                <div
                                    class="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wide"
                                >
                                    Longest
                                </div>
                            </div>
                        {/if}
                        {#if appStore.records.longestDuration}
                            <div class="export-record-card">
                                <Hourglass
                                    class="w-6 h-6 text-amber-400 mb-2"
                                    strokeWidth={1.5}
                                />
                                <div
                                    class="text-[28px] font-bold stat-value text-[var(--color-text-primary)]"
                                >
                                    {formatDuration(
                                        appStore.records.longestDuration.value,
                                    )}
                                </div>
                                <div
                                    class="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wide"
                                >
                                    Duration
                                </div>
                            </div>
                        {/if}
                        {#if appStore.records.biggestBurn}
                            <div class="export-record-card">
                                <Sparkles
                                    class="w-6 h-6 text-amber-400 mb-2"
                                    strokeWidth={1.5}
                                />
                                <div
                                    class="text-[28px] font-bold stat-value text-[var(--color-text-primary)]"
                                >
                                    {formatCalories(
                                        appStore.records.biggestBurn.value,
                                    )}
                                </div>
                                <div
                                    class="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wide"
                                >
                                    Burn
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Sport Breakdown -->
            {#if topSports.length > 0}
                <div class="mb-auto">
                    <h2
                        class="text-[20px] font-semibold text-[var(--color-text-muted)] mb-4 uppercase tracking-wider"
                    >
                        Activities
                    </h2>
                    <div class="grid grid-cols-4 gap-3">
                        {#each topSports as sport}
                            {@const IconComponent =
                                sportIcons[sport.type] ?? Target}
                            <div class="export-sport-card">
                                <IconComponent
                                    class="w-6 h-6 text-[var(--color-accent)] mb-2"
                                    strokeWidth={1.5}
                                />
                                <div
                                    class="text-[18px] font-bold text-[var(--color-text-primary)]"
                                >
                                    {sportNames[sport.type] ?? sport.type}
                                </div>
                                <div
                                    class="text-[14px] text-[var(--color-text-muted)]"
                                >
                                    {sport.count}×
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Watermark -->
            <div class="mt-auto pt-6 text-center">
                <p class="text-[16px] text-[var(--color-text-dim)] font-medium">
                    activeyear.app
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    .export-card-wrapper {
        transform: scale(var(--scale));
        transform-origin: top center;
        width: var(--width);
        height: var(--height);
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

    .export-stat-card {
        background: var(--color-accent-subtle);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
    }

    .export-stat-card.highlight {
        background: var(--color-accent-subtle);
        border-color: rgba(255, 255, 255, 0.1);
    }

    /* Theme-specific stat card styles */
    .theme-neon .export-stat-card.highlight {
        box-shadow: 0 0 20px var(--color-accent-glow);
    }

    .theme-minimalist .export-stat-card {
        background: rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
    }

    .theme-retro .export-stat-card {
        border: 4px solid var(--color-accent);
        border-radius: 0;
    }

    .export-record-card {
        background: var(--color-accent-subtle);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
    }

    .theme-minimalist .export-record-card {
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .theme-retro .export-record-card {
        border: 3px solid var(--color-accent);
        border-radius: 0;
    }

    .export-sport-card {
        background: var(--color-accent-subtle);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 12px;
        text-align: center;
    }

    .theme-minimalist .export-sport-card {
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .theme-retro .export-sport-card {
        border: 3px solid var(--color-accent);
        border-radius: 0;
    }

    .stat-value {
        font-family: "JetBrains Mono", monospace;
        letter-spacing: -0.02em;
    }
</style>
