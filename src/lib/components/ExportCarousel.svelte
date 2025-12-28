<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte.js";
    import ExportCard, { getExportElement } from "./ExportCard.svelte";
    import { exportToPng } from "$lib/utils/export.js";
    import { ChevronLeft, ChevronRight } from "@lucide/svelte";
    import type { CardVariant } from "$lib/types/index.js";

    let currentSlide = $state<0 | 1>(0);
    const slides: CardVariant[] = ["summary", "breakdown"];

    function nextSlide() {
        currentSlide = currentSlide === 0 ? 1 : 0;
    }

    function prevSlide() {
        currentSlide = currentSlide === 0 ? 1 : 0;
    }

    export async function exportAllCards(): Promise<void> {
        const baseFilename = appStore.userName
            ? `${appStore.userName.toLowerCase().replace(/\s+/g, "-")}-2025`
            : "activeyear-2025";

        // Store the original slide to restore later
        const originalSlide = currentSlide;

        // Export summary card
        currentSlide = 0;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for render
        const summaryEl = getExportElement();
        if (summaryEl) {
            await exportToPng(summaryEl, {
                filename: `${baseFilename}-summary`,
            });
        }

        // Export breakdown card
        currentSlide = 1;
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for render
        const breakdownEl = getExportElement();
        if (breakdownEl) {
            await exportToPng(breakdownEl, {
                filename: `${baseFilename}-breakdown`,
            });
        }

        // Restore original slide
        currentSlide = originalSlide;
    }
</script>

<div class="carousel-container">
    <!-- Card Display -->
    <div class="carousel-card">
        <ExportCard variant={slides[currentSlide]} />
    </div>

    <!-- Navigation Controls -->
    <div class="carousel-nav">
        <button
            onclick={prevSlide}
            class="nav-button"
            aria-label="Previous slide"
        >
            <ChevronLeft class="w-5 h-5" strokeWidth={2} />
        </button>

        <!-- Dots -->
        <div class="carousel-dots">
            {#each slides as _, i}
                <button
                    class="dot {currentSlide === i ? 'active' : ''}"
                    onclick={() => (currentSlide = i as 0 | 1)}
                    aria-label="Go to slide {i + 1}"
                ></button>
            {/each}
        </div>

        <button onclick={nextSlide} class="nav-button" aria-label="Next slide">
            <ChevronRight class="w-5 h-5" strokeWidth={2} />
        </button>
    </div>

    <!-- Slide Label -->
    <div class="slide-label">
        {currentSlide === 0 ? "Summary" : "Breakdown"} ({currentSlide +
            1}/{slides.length})
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
