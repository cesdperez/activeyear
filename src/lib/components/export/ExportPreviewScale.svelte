<script lang="ts">
    import type { Snippet } from "svelte";
    import { getExportDimensions } from "#lib/utils/export.js";
    import { getPreviewScale } from "#lib/utils/preview.js";
    import { PREVIEW_MAX_SCALE } from "#lib/constants/preview.js";

    let { children }: { children: Snippet } = $props();

    let dimensions = $derived(getExportDimensions());

    let scale = $state(PREVIEW_MAX_SCALE);

    $effect(() => {
        if (typeof window === "undefined") return;

        function updateScale() {
            scale = getPreviewScale(window.innerWidth, dimensions.width);
        }

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    });

    let scaledWidth = $derived(dimensions.width * scale);
    let scaledHeight = $derived(dimensions.height * scale);
</script>

<div
    class="export-card-wrapper"
    style="width: {scaledWidth}px; height: {scaledHeight}px;"
>
    <div
        style="width: {dimensions.width}px; height: {dimensions.height}px; transform: scale({scale}); transform-origin: top left;"
    >
        {@render children()}
    </div>
</div>

<style>
    .export-card-wrapper {
        margin-left: auto;
        margin-right: auto;
    }
</style>
