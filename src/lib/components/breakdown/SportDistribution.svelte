<script lang="ts">
    import SportDonut from "./SportDonut.svelte";
    import SportBars from "./SportBars.svelte";
    import type { BreakdownMetric, SportBreakdown } from "#lib/types/index.js";

    let {
        sports,
        metric,
        totalActivities,
    }: {
        sports: SportBreakdown[];
        metric: BreakdownMetric;
        totalActivities: number;
    } = $props();
</script>

<div class="flex items-center gap-12 mb-32 px-4">
    <SportDonut {sports} {totalActivities} />
    <SportBars {sports} {metric} />
</div>
