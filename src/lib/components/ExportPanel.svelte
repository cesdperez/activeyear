<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { tick } from 'svelte';
	import { track } from '#lib/analytics/track.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { observeExportActions } from '#lib/stores/supportVisibility.svelte.js';
	import ExportCarousel from './ExportCarousel.svelte';
	import SupportLink from './dashboard/SupportLink.svelte';
	import LightmileDisclosure from './LightmileDisclosure.svelte';
	import SectionHeading from './dashboard/SectionHeading.svelte';
	import { DownloadSimple, Image as ImageIcon, SpinnerGap, Trash } from 'phosphor-svelte';
	import type {
		Theme,
		SummaryMetric,
		AvatarError,
		ExportError,
		ExportStatus
	} from '#lib/types/index.js';
	import { THEME_OPTIONS, USER_NAME_MAX_LENGTH } from '#lib/constants/export.js';
	import { FontsUnavailableError } from '#lib/utils/fonts.js';

	let exportError = $state<ExportError | null>(null);
	let exportStatus = $state<ExportStatus | null>(null);
	let avatarError = $state<AvatarError | null>(null);
	let avatarInput = $state<HTMLInputElement | null>(null);
	let removeImageButton = $state<HTMLButtonElement | null>(null);
	let carouselRef = $state<{
		exportAllCards: (options?: { allowFallbackFonts?: boolean }) => Promise<void>;
	} | null>(null);

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

	async function handleExport(allowFallbackFonts = false) {
		if (exportLock.isExporting) return;
		if (!carouselRef) {
			exportError = { type: 'ready' };
			return;
		}
		const carousel = carouselRef;

		exportError = null;
		exportStatus = { type: 'generating' };

		await exportLock.hold(async () => {
			try {
				await carousel.exportAllCards({ allowFallbackFonts });
				track('export', exportSettings.theme);
				exportStatus = { type: 'done' };
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
	}

	function readAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	// Decoded from a data URL because the CSP img-src allows data: but not blob:.
	async function loadImageDataUrl(file: File): Promise<string | null> {
		try {
			const dataUrl = await readAsDataUrl(file);
			const image = new Image();
			image.src = dataUrl;
			await image.decode();
			return dataUrl;
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

	<!-- Controls Row -->
	<div class="flex flex-col items-start gap-10 lg:flex-row lg:gap-16">
		<!-- Left: Controls -->
		<div class="w-full shrink-0 space-y-6 lg:w-80">
			<!-- Name Input -->
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
					class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-dim)] transition-colors focus-visible:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>

			<!-- Profile Picture Upload -->
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
							class="p-2 text-[var(--color-text-dim)] transition-colors enabled:hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
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

			<!-- Summary Metric Selector -->
			<div>
				<span id="summary-metric-label" class="field-label">{i18n.m.export.focused}</span>
				<div role="group" aria-labelledby="summary-metric-label" class="grid grid-cols-2 gap-2">
					{#each metrics as metric (metric.value)}
						<button
							onclick={() => (exportSettings.summaryMetric = metric.value)}
							aria-pressed={exportSettings.summaryMetric === metric.value}
							disabled={exportLock.isExporting}
							class="toggle px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
						>
							{metric.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Theme Selector -->
			<div>
				<span id="theme-label" class="field-label">{i18n.m.export.theme}</span>
				<div
					role="group"
					aria-labelledby="theme-label"
					class="grid grid-cols-2 gap-2 sm:grid-cols-3"
				>
					{#each THEME_OPTIONS as theme (theme.value)}
						<div class="theme-cell">
							<button
								onclick={() => setTheme(theme.value)}
								aria-pressed={exportSettings.theme === theme.value}
								disabled={exportLock.isExporting}
								class="toggle h-full w-full px-4 py-3 text-center disabled:cursor-not-allowed disabled:opacity-50"
							>
								<div class="text-sm">{theme.label}</div>
								<div class="theme-description text-xs">{descriptions[theme.value]}</div>
							</button>
							{#if theme.value === 'lightmile'}
								<LightmileDisclosure />
							{/if}
						</div>
					{/each}
				</div>
			</div>

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

			<p id="export-status" role="status" class="sr-only">
				{exportStatus ? i18n.m.export[exportStatus.type] : ''}
			</p>
			<div id="export-error" role="alert" class="empty:hidden">
				{#if exportError}
					<p class="text-sm text-[var(--color-text-primary)]">{i18n.m.export[exportError.type]}</p>
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

			<p class="text-xs text-[var(--color-text-dim)]">
				{i18n.m.export.downloads}
			</p>
		</div>

		<!-- Right: Preview -->
		<div class="preview-container flex w-full flex-1 flex-col items-center lg:items-start">
			<div class="field-label">{i18n.m.export.preview}</div>
			<div class="preview-wrapper">
				<ExportCarousel bind:this={carouselRef} />
			</div>
		</div>
	</div>
</section>

<style>
	.export-panel {
		padding-top: 4rem;
		border-top: 1px solid var(--color-border);
	}

	.field-label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
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

	.toggle[aria-pressed='false']:enabled:hover {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	/* Pressed is a filled accent block against outlined, unpressed toggles. */
	.toggle[aria-pressed='true'] {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.theme-cell {
		position: relative;
		min-width: 0;
	}

	.preview-wrapper {
		width: 100%;
		max-width: 400px;
	}
</style>
