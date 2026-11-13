<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { onDestroy, tick } from 'svelte';
	import { track } from '#lib/analytics/track.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { highlightsStore } from '#lib/stores/highlights.svelte.js';
	import { observeExportActions } from '#lib/stores/supportVisibility.svelte.js';
	import ExportCarousel from './ExportCarousel.svelte';
	import SupportLink from './dashboard/SupportLink.svelte';
	import LightmileDisclosure from './LightmileDisclosure.svelte';
	import SectionHeading from './dashboard/SectionHeading.svelte';
	import {
		CheckCircle,
		DownloadSimple,
		Image as ImageIcon,
		SpinnerGap,
		Trash
	} from 'phosphor-svelte';
	import type {
		Theme,
		SummaryMetric,
		AvatarError,
		ExportError,
		ExportStatus
	} from '#lib/types/index.js';
	import { AVATAR_MAX_SIDE, THEME_OPTIONS, USER_NAME_MAX_LENGTH } from '#lib/constants/export.js';
	import { avatarSize } from '#lib/utils/avatar.js';
	import { FontsUnavailableError } from '#lib/utils/fonts.js';

	const CONFIRMATION_MS = 5000;

	let exportError = $state<ExportError | null>(null);
	let exportStatus = $state<ExportStatus | null>(null);
	let confirming = $state(false);
	let confirmationTimer: ReturnType<typeof setTimeout>;
	let avatarError = $state<AvatarError | null>(null);
	let avatarInput = $state<HTMLInputElement | null>(null);
	let removeImageButton = $state<HTMLButtonElement | null>(null);
	let carouselRef = $state<{
		exportAllCards: (options?: { allowFallbackFonts?: boolean }) => Promise<number>;
	} | null>(null);

	onDestroy(() => clearTimeout(confirmationTimer));

	const descriptions = $derived<Record<Theme, string>>({
		neon: i18n.m.export.nightRace,
		minimalist: i18n.m.export.resultSheet,
		retro: i18n.m.export.arcade,
		classic: i18n.m.export.classic,
		synthwave: i18n.m.export.synthwave,
		lightmile: i18n.m.export.lightmile
	});

	const metrics = $derived<{ value: SummaryMetric; label: string }[]>([
		{ value: 'distance', label: i18n.m.export.distance },
		{ value: 'elevation', label: i18n.m.export.elevation },
		{ value: 'duration', label: i18n.m.export.time },
		{ value: 'calories', label: i18n.m.export.calories }
	]);

	const downloadsNote = $derived(
		highlightsStore.highlights.length
			? i18n.m.export.downloads
			: i18n.m.export.downloadsWithoutHighlights
	);

	const statusText = $derived.by(() => {
		if (!exportStatus) return '';
		if (exportStatus.type === 'generating') return i18n.m.export.generating;
		return exportStatus.cards === 3 ? i18n.m.export.done : i18n.m.export.doneWithoutHighlights;
	});

	async function handleExport(allowFallbackFonts = false) {
		if (exportLock.isExporting) return;
		if (!carouselRef) {
			exportError = { type: 'ready' };
			return;
		}
		const carousel = carouselRef;

		exportError = null;
		avatarError = null;
		confirming = false;
		clearTimeout(confirmationTimer);
		exportStatus = { type: 'generating' };

		await exportLock.hold(async () => {
			try {
				const cards = await carousel.exportAllCards({ allowFallbackFonts });
				track('export', exportSettings.theme);
				exportStatus = { type: 'done', cards };
				confirming = true;
				confirmationTimer = setTimeout(() => (confirming = false), CONFIRMATION_MS);
			} catch (error) {
				exportStatus = null;
				exportError = {
					type: error instanceof FontsUnavailableError ? 'fontsUnavailable' : 'failed'
				};
			}
		});
	}

	function setTheme(theme: Theme) {
		if (exportSettings.theme !== theme) track('theme_selected', theme);
		exportSettings.theme = theme;
		avatarError = null;
	}

	function setSummaryMetric(metric: SummaryMetric) {
		exportSettings.summaryMetric = metric;
		avatarError = null;
	}

	function readAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	// A phone photo is several MB; keep only what the cards draw. JPEG unless the file may be transparent.
	function downscale(image: HTMLImageElement, type: string): string | null {
		const { width, height } = avatarSize(image.naturalWidth, image.naturalHeight, AVATAR_MAX_SIDE);
		if (width === image.naturalWidth && height === image.naturalHeight) return null;
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
		return type === 'image/jpeg'
			? canvas.toDataURL('image/jpeg', 0.9)
			: canvas.toDataURL('image/png');
	}

	// Decoded from a data URL because the CSP img-src allows data: but not blob:.
	async function loadImageDataUrl(file: File): Promise<string | null> {
		try {
			const dataUrl = await readAsDataUrl(file);
			const image = new Image();
			image.src = dataUrl;
			await image.decode();
			return downscale(image, file.type) ?? dataUrl;
		} catch {
			return null;
		}
	}

	async function handleImageUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		// Cleared so choosing the same file again still fires change.
		input.value = '';
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			await showAvatarError({ type: 'invalid' });
			return;
		}

		const dataUrl = await loadImageDataUrl(file);
		if (!dataUrl) {
			await showAvatarError({ type: 'unreadable' });
			return;
		}

		avatarError = null;
		exportSettings.userPfp = dataUrl;
		// The file input is replaced by the preview, which would drop focus to the page.
		await tick();
		removeImageButton?.focus();
	}

	async function showAvatarError(error: AvatarError) {
		// Re-inserting the alert makes screen readers announce a repeated message again.
		avatarError = null;
		await tick();
		avatarError = error;
	}

	async function removeImage() {
		exportSettings.userPfp = null;
		await tick();
		avatarInput?.focus();
	}
</script>

<section class="export-panel" id="export-panel">
	<SectionHeading title={i18n.m.export.export} />
	<p class="-mt-3 mb-8 text-[var(--color-text-muted)]">
		{i18n.m.export.intro}
	</p>

	<!-- Preview first, so on a phone the card is in view while the theme under it changes. -->
	<div class="export-layout">
		<div class="preview-column">
			<div class="field-label">{i18n.m.export.preview}</div>
			<ExportCarousel bind:this={carouselRef} />
		</div>

		<div class="controls space-y-6">
			<div>
				<span id="theme-label" class="field-label">{i18n.m.export.theme}</span>
				<div role="group" aria-labelledby="theme-label" class="theme-grid">
					{#each THEME_OPTIONS as theme (theme.value)}
						<button
							onclick={() => setTheme(theme.value)}
							aria-pressed={exportSettings.theme === theme.value}
							disabled={exportLock.isExporting}
							class="toggle px-3 py-3 text-center disabled:cursor-not-allowed disabled:opacity-50"
						>
							<span class="block text-sm">{theme.label}</span>
							<span class="theme-description block text-xs">{descriptions[theme.value]}</span>
						</button>
					{/each}
				</div>
				<LightmileDisclosure />
			</div>

			<div>
				<span id="summary-metric-label" class="field-label">{i18n.m.export.focused}</span>
				<div role="group" aria-labelledby="summary-metric-label" class="grid grid-cols-2 gap-2">
					{#each metrics as metric (metric.value)}
						<button
							onclick={() => setSummaryMetric(metric.value)}
							aria-pressed={exportSettings.summaryMetric === metric.value}
							disabled={exportLock.isExporting}
							class="toggle min-h-11 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
						>
							{metric.label}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<label for="userName" class="field-label">{i18n.m.export.name}</label>
				<input
					type="text"
					id="userName"
					autocomplete="name"
					bind:value={exportSettings.userName}
					maxlength={USER_NAME_MAX_LENGTH}
					disabled={exportLock.isExporting}
					placeholder="César"
					class="w-full rounded-[var(--radius-control)] border border-[var(--color-input-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-dim)] transition-colors focus-visible:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>

			<div>
				<label for="userAvatar" class="field-label">{i18n.m.export.picture}</label>
				{#if exportSettings.userPfp}
					<div
						class="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3"
					>
						<img
							src={exportSettings.userPfp}
							alt={i18n.m.export.preview}
							class="h-12 w-12 rounded-full border border-[var(--color-border)] object-cover"
						/>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs text-[var(--color-text-dim)]">{i18n.m.export.custom}</p>
						</div>
						<button
							bind:this={removeImageButton}
							onclick={removeImage}
							disabled={exportLock.isExporting}
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-text-dim)] transition-colors enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
							title={i18n.m.export.remove}
						>
							<Trash class="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				{:else}
					<div class="relative">
						<input
							type="file"
							id="userAvatar"
							accept="image/*"
							bind:this={avatarInput}
							disabled={exportLock.isExporting}
							onchange={handleImageUpload}
							aria-describedby={avatarError ? 'userAvatar-error' : undefined}
							class="peer sr-only"
						/>
						<label
							for="userAvatar"
							class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[var(--radius-control)] border border-dashed border-[var(--color-text-dim)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text-dim)] transition-all peer-focus-visible:border-[var(--color-accent)] peer-focus-visible:text-[var(--color-text-primary)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--color-accent)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-enabled:hover:border-[var(--color-accent)] peer-enabled:hover:text-[var(--color-text-primary)]"
						>
							<ImageIcon class="h-5 w-5" aria-hidden="true" />
							<span class="text-sm font-medium">{i18n.m.export.upload}</span>
						</label>
					</div>
				{/if}
				{#if avatarError}
					<p
						id="userAvatar-error"
						role="alert"
						class="mt-2 text-sm text-[var(--color-text-primary)]"
					>
						{i18n.m.export[avatarError.type]}
					</p>
				{/if}
			</div>

			<div class="space-y-3">
				<!-- aria-disabled instead of disabled keeps focus on the button while exporting. -->
				<button
					{@attach observeExportActions}
					id="export-download"
					onclick={() => handleExport()}
					aria-disabled={exportLock.isExporting}
					class="btn-primary flex w-full items-center justify-center gap-3 text-base aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
				>
					{#if exportLock.isExporting}
						<SpinnerGap class="h-5 w-5 animate-spin" weight="bold" aria-hidden="true" />
						{i18n.m.export.generating}
					{:else}
						<DownloadSimple class="h-5 w-5" weight="bold" aria-hidden="true" />
						{i18n.m.export.download}
					{/if}
				</button>

				<p id="export-status" role="status" class="sr-only">{statusText}</p>
				<!-- The status region above announces the confirmation, so this copy stays silent. -->
				{#if confirming}
					<p class="export-note confirmed" aria-hidden="true">
						<CheckCircle class="h-4 w-4 shrink-0" weight="bold" />
						{statusText}
					</p>
				{:else}
					<p class="export-note">{downloadsNote}</p>
				{/if}

				<div id="export-error" role="alert" class="empty:hidden">
					{#if exportError}
						<p class="text-sm text-[var(--color-text-primary)]">
							{i18n.m.export[exportError.type]}
						</p>
						{#if exportError.type === 'fontsUnavailable'}
							<button
								onclick={() => handleExport(true)}
								class="mt-2 text-sm font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
							>
								{i18n.m.export.fallback}
							</button>
						{/if}
					{/if}
				</div>

				{#if exportStatus?.type === 'done'}
					<SupportLink placement="export" />
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.export-panel {
		padding-top: 4rem;
		border-top: 1px solid var(--color-border);
	}

	.export-layout {
		display: flex;
		flex-direction: column;
		align-items: safe center;
		gap: 2rem;
	}

	.preview-column {
		max-width: 100%;
	}

	.controls {
		width: 100%;
	}

	/* Two columns, centred together, so they line up with the centred actions under the panel. */
	@media (min-width: 64rem) {
		.export-layout {
			flex-direction: row;
			align-items: flex-start;
			justify-content: safe center;
			gap: 4rem;
		}

		.controls {
			width: 20rem;
		}
	}

	.field-label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	/* Equal rows, so every tile is as tall as the one with the longest description. */
	.theme-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-auto-rows: 1fr;
		gap: 0.5rem;
	}

	.theme-description {
		text-wrap: balance;
	}

	.toggle {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: transparent;
		color: var(--color-text-muted);
		font-weight: 600;
		transition:
			border-color 0.2s ease-out,
			color 0.2s ease-out;
	}

	@media (hover: hover) {
		.toggle[aria-pressed='false']:enabled:hover {
			border-color: var(--color-accent);
			color: var(--color-text-primary);
		}
	}

	/* Pressed is a filled accent block against outlined, unpressed toggles. */
	.toggle[aria-pressed='true'] {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	/* One line tall in both states, so the confirmation does not move what is under it. */
	.export-note {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-height: 1.25rem;
		font-size: 0.75rem;
		color: var(--color-text-dim);
	}

	.export-note.confirmed {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.export-note.confirmed :global(svg) {
		color: var(--color-accent);
	}
</style>
