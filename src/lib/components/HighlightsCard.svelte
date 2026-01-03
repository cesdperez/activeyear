<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte.js";
    import { formatDistance, formatDuration } from "$lib/utils/format.js";
    import { Star, Target } from "phosphor-svelte";
    import { sportNames, sportIcons } from "$lib/constants/sports.js";
    import ExportCardBase from "./ExportCardBase.svelte";

    const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
    ];

    let highlights = $derived(
        appStore.highlights
            .slice(0, 10)
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            ),
    );
</script>

<ExportCardBase variant="highlights" title="HIGHLIGHTS">
    <div class="flex-1 flex flex-col px-6 -mt-[52px]">
        {#if highlights.length === 0}
            <div class="flex-1 flex items-center justify-center">
                <div
                    class="text-center text-[var(--color-text-muted)] text-[28px]"
                >
                    No highlight activities yet
                </div>
            </div>
        {:else}
            <!-- Timeline Container -->
            <div class="relative flex-1 flex flex-col justify-center">
                <!-- Timeline Items -->
                <div
                    class="flex flex-col w-full relative"
                    style="gap: {Math.min(
                        160,
                        Math.max(
                            32,
                            (1250 - highlights.length * 120) /
                                Math.max(highlights.length - 1, 1),
                        ),
                    )}px;"
                >
                    <!-- Vertical Timeline Line -->
                    <div
                        class="absolute left-[60px] top-[45px] bottom-[45px] w-[4px] timeline-line"
                    ></div>
                    {#each highlights as fav, i}
                        {@const IconComponent = sportIcons[fav.type] ?? Target}
                        {@const date = new Date(fav.date)}
                        {@const month = monthNames[date.getMonth()]}
                        {@const day = date.getDate()}

                        <div class="flex items-center gap-6 relative">
                            <!-- Date Column -->
                            <div class="w-[48px] text-center shrink-0">
                                <div
                                    class="text-[14px] font-bold text-[var(--color-accent)] tracking-widest"
                                >
                                    {month}
                                </div>
                                <div
                                    class="text-[32px] font-black text-[var(--color-text-primary)] leading-none"
                                >
                                    {day}
                                </div>
                            </div>

                            <!-- Timeline Node -->
                            <div
                                class="relative z-10 w-[28px] h-[28px] rounded-full timeline-node flex items-center justify-center shrink-0"
                            >
                                <div
                                    class="w-[14px] h-[14px] rounded-full bg-[var(--color-accent)]"
                                ></div>
                            </div>

                            <!-- Activity Card -->
                            <div
                                class="flex-1 flex items-center {highlights.length <
                                7
                                    ? 'gap-8 p-8'
                                    : 'gap-4 p-4'} rounded-2xl timeline-card"
                            >
                                <div
                                    class="{highlights.length < 7
                                        ? 'w-16 h-16 rounded-2xl'
                                        : 'w-12 h-12 rounded-xl'} flex items-center justify-center bg-[var(--color-accent)]/20 text-[var(--color-accent)] shrink-0"
                                >
                                    <IconComponent
                                        class={highlights.length < 7
                                            ? "w-8 h-8"
                                            : "w-6 h-6"}
                                        weight="bold"
                                    />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1">
                                        <Star
                                            class="{highlights.length < 7
                                                ? 'w-6 h-6'
                                                : 'w-4 h-4'} text-yellow-500 shrink-0"
                                            weight="fill"
                                        />
                                        <div
                                            class="{highlights.length < 7
                                                ? 'text-[32px]'
                                                : 'text-[22px]'} font-bold text-[var(--color-text-primary)] line-clamp-2 flex-1 min-w-0"
                                        >
                                            {fav.title ||
                                                sportNames[fav.type] ||
                                                "Activity"}
                                        </div>
                                    </div>
                                    <div
                                        class="flex flex-wrap items-center gap-x-3 gap-y-1 {highlights.length <
                                        7
                                            ? 'text-[22px]'
                                            : 'text-[16px]'} text-[var(--color-text-muted)]"
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
                                            {formatDuration(fav.duration)}
                                        </span>
                                        <span
                                            class="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[12px] uppercase tracking-wider text-[var(--color-accent)]"
                                        >
                                            {sportNames[fav.type] ?? fav.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            {#if appStore.highlights.length > 10}
                <div
                    class="text-center text-[var(--color-text-muted)] text-[20px] mt-6"
                >
                    +{appStore.highlights.length - 10} more highlights
                </div>
            {/if}
        {/if}
    </div>
</ExportCardBase>
