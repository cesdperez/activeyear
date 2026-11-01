<script lang="ts">
    import { sportColors } from "#lib/constants/sports.js";
    import { donutSegments } from "#lib/utils/breakdown.js";
    import type { SportBreakdown } from "#lib/types/index.js";

    let {
        sports,
        totalActivities,
    }: { sports: SportBreakdown[]; totalActivities: number } = $props();

    // Matches the r="80" of the circles below.
    const circumference = 2 * Math.PI * 80;

    let segments = $derived(donutSegments(sports, circumference));
</script>

<div class="shrink-0 relative">
    <div class="donut-chart-container !w-[280px] !h-[280px]">
        <svg viewBox="0 0 200 200" class="donut-chart">
            <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(0,0,0,0.05)"
                class="donut-bg"
                stroke-width="28"
            />
            {#each segments as segment, i}
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={sportColors[i % sportColors.length]}
                    stroke-width="28"
                    stroke-dasharray={segment.dashArray}
                    stroke-dashoffset={-segment.offset}
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
