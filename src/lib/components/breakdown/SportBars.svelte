<script lang="ts">
    import { Target } from "phosphor-svelte";
    import {
        sportNames,
        sportIcons,
        sportColors,
    } from "#lib/constants/sports.js";
    import { formatDuration } from "#lib/utils/format.js";
    import type { BreakdownMetric, SportBreakdown } from "#lib/types/index.js";

    let {
        sports,
        metric,
    }: { sports: SportBreakdown[]; metric: BreakdownMetric } = $props();

    const maxValue = $derived(Math.max(...sports.map((s) => s[metric]), 1));
</script>

<div class="flex-1 space-y-6">
    {#each sports as sport, i}
        {@const IconComponent = sportIcons[sport.type] ?? Target}
        {@const value = sport[metric]}
        {@const percentage = (value / maxValue) * 100}
        {@const color = sportColors[i % sportColors.length]}

        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center"
                        style="background: {color}20; color: {color};"
                    >
                        <IconComponent class="w-5 h-5" weight="bold" />
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
                        {metric === "count" ? value : formatDuration(value)}
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
