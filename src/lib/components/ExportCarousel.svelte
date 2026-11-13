<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import SummaryCard from './SummaryCard.svelte';
	import BreakdownCard from './BreakdownCard.svelte';
	import HighlightsCard from './HighlightsCard.svelte';
	import { exportFileStem, exportToPng } from '#lib/utils/export.js';
	import { CaretLeft, CaretRight } from 'phosphor-svelte';

	let currentSlide = $state<0 | 1 | 2>(0);
	const slideLabels = $derived([
		i18n.m.export.summary,
		i18n.m.export.breakdown,
		i18n.m.export.highlights
	]);
	const fileLabels = ['summary', 'breakdown', 'highlights'];

	const SLIDE_COUNT = 3;
	const SWIPE_THRESHOLD_PX = 50;

	let swipeStart: { x: number; y: number } | null = null;

	function nextSlide() {
		currentSlide = ((currentSlide + 1) % SLIDE_COUNT) as 0 | 1 | 2;
	}

	function prevSlide() {
		currentSlide = ((currentSlide - 1 + SLIDE_COUNT) % SLIDE_COUNT) as 0 | 1 | 2;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (exportLock.isExporting) return;
		if (event.key === 'ArrowRight') nextSlide();
		else if (event.key === 'ArrowLeft') prevSlide();
		else return;
		event.preventDefault();
	}

	function handlePointerDown(event: PointerEvent) {
		if (!event.isPrimary) return;
		swipeStart = { x: event.clientX, y: event.clientY };
	}

	function handlePointerUp(event: PointerEvent) {
		if (!swipeStart || exportLock.isExporting) {
			swipeStart = null;
			return;
		}
		const dx = event.clientX - swipeStart.x;
		const dy = event.clientY - swipeStart.y;
		swipeStart = null;

		if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;
		if (dx < 0) nextSlide();
		else prevSlide();
	}

	function getExportElement(): HTMLElement | null {
		return document.getElementById('export-card');
	}

	export async function exportAllCards({ allowFallbackFonts = false } = {}): Promise<void> {
		const baseFilename = exportFileStem(exportSettings.displayName, TARGET_YEAR);

		const theme = exportSettings.theme;
		const originalSlide = currentSlide;

		try {
			for (const [index, label] of fileLabels.entries()) {
				currentSlide = index as 0 | 1 | 2;
				await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for render
				const cardEl = getExportElement();
				if (cardEl) {
					await exportToPng(cardEl, {
						filename: `${baseFilename}-${label.toLowerCase()}`,
						theme,
						allowFallbackFonts
					});
				}
			}
		} finally {
			currentSlide = originalSlide;
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<section
	class="carousel-container"
	aria-label={i18n.m.export.previewLabel}
	aria-roledescription={i18n.m.export.carousel}
	tabindex="0"
	onkeydown={handleKeydown}
>
	<div
		class="carousel-card"
		role="presentation"
		onpointerdown={handlePointerDown}
		onpointerup={handlePointerUp}
		onpointercancel={() => (swipeStart = null)}
	>
		{#if currentSlide === 0}
			<SummaryCard />
		{:else if currentSlide === 1}
			<BreakdownCard />
		{:else}
			<HighlightsCard />
		{/if}
	</div>

	<div class="carousel-nav">
		<button
			onclick={prevSlide}
			disabled={exportLock.isExporting}
			class="nav-button"
			aria-label={i18n.m.export.previous}
		>
			<CaretLeft class="h-5 w-5" weight="bold" aria-hidden="true" />
		</button>

		<div class="carousel-dots">
			{#each { length: SLIDE_COUNT }, i}
				<button
					class="dot {currentSlide === i ? 'active' : ''}"
					aria-current={currentSlide === i ? 'true' : undefined}
					onclick={() => (currentSlide = i as 0 | 1 | 2)}
					disabled={exportLock.isExporting}
					aria-label={i18n.m.export.goToSlide(i + 1)}
				></button>
			{/each}
		</div>

		<button
			onclick={nextSlide}
			disabled={exportLock.isExporting}
			class="nav-button"
			aria-label={i18n.m.export.next}
		>
			<CaretRight class="h-5 w-5" weight="bold" aria-hidden="true" />
		</button>
	</div>

	<!-- Silent while exporting, which flips through every slide. -->
	<div class="slide-label" aria-live={exportLock.isExporting ? 'off' : 'polite'} aria-atomic="true">
		{slideLabels[currentSlide]} ({currentSlide + 1}/{SLIDE_COUNT})
	</div>
</section>

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
		border-radius: var(--radius-panel);
		border: 1px solid var(--color-border);
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
		width: 2.75rem;
		height: 2.75rem;
		border-radius: var(--radius-control);
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		transition:
			border-color 0.2s ease-out,
			color 0.2s ease-out;
		cursor: pointer;
	}

	.nav-button:hover:enabled {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.carousel-dots {
		display: flex;
	}

	.dot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 2.75rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
	}

	.dot::before {
		content: '';
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 9999px;
		background: var(--color-text-dim);
		transition: all 0.2s ease-out;
	}

	/* The button is a large hit area around a small dot, so the ring goes on the dot. */
	.dot:focus-visible {
		outline: none;
	}

	.dot:focus-visible::before {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
	}

	.dot.active::before {
		background: var(--color-accent);
		transform: scale(1.2);
	}

	.dot:hover:enabled:not(.active)::before {
		background: var(--color-text-muted);
	}

	.dot:disabled,
	.nav-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	@media (forced-colors: active) {
		.dot::before {
			border: 1px solid CanvasText;
		}

		.dot.active::before {
			forced-color-adjust: none;
			background: CanvasText;
		}
	}

	/* Fixed height so a longer label never moves the controls below the preview. */
	.slide-label {
		min-height: 1.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}
</style>
