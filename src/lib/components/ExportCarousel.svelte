<script lang="ts">
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import SummaryCard from './SummaryCard.svelte';
	import BreakdownCard from './BreakdownCard.svelte';
	import HighlightsCard from './HighlightsCard.svelte';
	import { exportToPng, getThemeBackgroundColor } from '#lib/utils/export.js';
	import { CaretLeft, CaretRight } from 'phosphor-svelte';

	let currentSlide = $state<0 | 1 | 2>(0);
	let isExporting = $state(false);
	const slideLabels = ['Summary', 'Breakdown', 'Highlights'];

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
		if (isExporting) return;
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
		if (!swipeStart || isExporting) {
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

	export async function exportAllCards(): Promise<void> {
		const baseFilename = appStore.userName
			? `${appStore.userName.toLowerCase().replace(/\s+/g, '-')}-${TARGET_YEAR}`
			: `activeyear-${TARGET_YEAR}`;

		const backgroundColor = getThemeBackgroundColor(appStore.theme);
		const originalSlide = currentSlide;
		isExporting = true;

		try {
			for (const [index, label] of slideLabels.entries()) {
				currentSlide = index as 0 | 1 | 2;
				await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for render
				const cardEl = getExportElement();
				if (cardEl) {
					await exportToPng(cardEl, {
						filename: `${baseFilename}-${label.toLowerCase()}`,
						backgroundColor
					});
				}
			}
		} finally {
			currentSlide = originalSlide;
			isExporting = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<section
	class="carousel-container"
	aria-label="Export card preview"
	aria-roledescription="carousel"
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
			disabled={isExporting}
			class="nav-button"
			aria-label="Previous slide"
		>
			<CaretLeft class="h-5 w-5" weight="bold" aria-hidden="true" />
		</button>

		<div class="carousel-dots">
			{#each { length: SLIDE_COUNT }, i}
				<button
					class="dot {currentSlide === i ? 'active' : ''}"
					aria-current={currentSlide === i ? 'true' : undefined}
					onclick={() => (currentSlide = i as 0 | 1 | 2)}
					disabled={isExporting}
					aria-label="Go to slide {i + 1}"
				></button>
			{/each}
		</div>

		<button onclick={nextSlide} disabled={isExporting} class="nav-button" aria-label="Next slide">
			<CaretRight class="h-5 w-5" weight="bold" aria-hidden="true" />
		</button>
	</div>

	<!-- Silent while exporting, which flips through every slide. -->
	<div class="slide-label" aria-live={isExporting ? 'off' : 'polite'} aria-atomic="true">
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

	.dot.active::before {
		background: var(--color-accent);
		transform: scale(1.2);
	}

	.dot:hover:not(.active)::before {
		background: var(--color-text-muted);
	}

	.dot:disabled,
	.nav-button:disabled {
		cursor: not-allowed;
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

	.slide-label {
		font-size: 0.875rem;
		color: var(--color-text-dim);
	}
</style>
