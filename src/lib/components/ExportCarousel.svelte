<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte.js";
    import SummaryCard from "./SummaryCard.svelte";
    import BreakdownCard from "./BreakdownCard.svelte";
    import HighlightsCard from "./HighlightsCard.svelte";
    import { exportToPng, getThemeBackgroundColor } from "$lib/utils/export.js";
    import { CaretLeft, CaretRight } from "phosphor-svelte";

    let currentSlide = $state<0 | 1 | 2>(0);
    const slideLabels = ["Summary", "Breakdown", "Highlights"];

    const SLIDE_COUNT = 3;

    function nextSlide() {
        currentSlide = ((currentSlide + 1) % SLIDE_COUNT) as 0 | 1 | 2;
    }

    function prevSlide() {
        currentSlide = ((currentSlide - 1 + SLIDE_COUNT) % SLIDE_COUNT) as
            | 0
            | 1
            | 2;
    }

    function getExportElement(): HTMLElement | null {
        return document.getElementById("export-card");
    }

    export async function exportAllCards(): Promise<void> {
        const baseFilename = appStore.userName
            ? `${appStore.userName.toLowerCase().replace(/\s+/g, "-")}-${appStore.selectedYear}`
            : `activeyear-${appStore.selectedYear}`;

        const backgroundColor = getThemeBackgroundColor(appStore.theme);

        // Store the original slide to restore later
        const originalSlide = currentSlide;

        // Export summary card
        currentSlide = 0;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for render
        const summaryEl = getExportElement();
        if (summaryEl) {
            await exportToPng(summaryEl, {
                filename: `${baseFilename}-summary`,
                backgroundColor,
            });
        }

        // Export breakdown card
        currentSlide = 1;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for render
        const breakdownEl = getExportElement();
        if (breakdownEl) {
            await exportToPng(breakdownEl, {
                filename: `${baseFilename}-breakdown`,
                backgroundColor,
            });
        }

        // Export highlights card
        currentSlide = 2;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for render
        const highlightsEl = getExportElement();
        if (highlightsEl) {
            await exportToPng(highlightsEl, {
                filename: `${baseFilename}-highlights`,
                backgroundColor,
            });
        }

        // Restore original slide
        currentSlide = originalSlide;
    }
</script>

<div class="carousel-container">
    <!-- Card Display -->
    <div class="carousel-card">
        {#if currentSlide === 0}
            <SummaryCard />
        {:else if currentSlide === 1}
            <BreakdownCard />
        {:else}
            <HighlightsCard />
        {/if}
    </div>

    <!-- Navigation Controls -->
    <div class="carousel-nav">
        <button
            onclick={prevSlide}
            class="nav-button"
            aria-label="Previous slide"
        >
            <CaretLeft class="w-5 h-5" weight="bold" />
        </button>

        <!-- Dots -->
        <div class="carousel-dots">
            {#each { length: SLIDE_COUNT } as _, i}
                <button
                    class="dot {currentSlide === i ? 'active' : ''}"
                    onclick={() => (currentSlide = i as 0 | 1 | 2)}
                    aria-label="Go to slide {i + 1}"
                ></button>
            {/each}
        </div>

        <button onclick={nextSlide} class="nav-button" aria-label="Next slide">
            <CaretRight class="w-5 h-5" weight="bold" />
        </button>
    </div>

    <!-- Slide Label -->
    <div class="slide-label">
        {slideLabels[currentSlide]} ({currentSlide + 1}/{SLIDE_COUNT})
    </div>
</div>

<style>
    .carousel-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .carousel-card {
        position: relative;
        overflow: hidden;
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        max-width: 100%;
        touch-action: pan-y;
    }

    .carousel-nav {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .nav-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 9999px;
        background: var(--color-surface-elevated);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--color-text-muted);
        transition: all 0.2s ease-out;
        cursor: pointer;
    }

    .nav-button:hover {
        background: var(--color-surface-hover);
        color: var(--color-text-primary);
        border-color: var(--color-accent);
    }

    .carousel-dots {
        display: flex;
        gap: 0.5rem;
    }

    .dot {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 9999px;
        background: var(--color-text-dim);
        border: none;
        cursor: pointer;
        transition: all 0.2s ease-out;
    }

    .dot.active {
        background: var(--color-accent);
        transform: scale(1.2);
    }

    .dot:hover:not(.active) {
        background: var(--color-text-muted);
    }

    .slide-label {
        font-size: 0.875rem;
        color: var(--color-text-dim);
    }
</style>
