<script lang="ts">
	import { tick } from 'svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
	import ExportCarousel from './ExportCarousel.svelte';
	import {
		DownloadSimple,
		Image as ImageIcon,
		Trash,
		Ruler,
		Mountains,
		Timer,
		Fire
	} from 'phosphor-svelte';
	import type { Theme, SummaryMetric } from '#lib/types/index.js';
	import { USER_NAME_MAX_LENGTH } from '#lib/constants/export.js';
	import { FontsUnavailableError } from '#lib/utils/fonts.js';

	let exportError = $state<{ message: string; fontsUnavailable: boolean } | null>(null);
	let exportStatus = $state('');
	let avatarError = $state<string | null>(null);
	let avatarInput = $state<HTMLInputElement | null>(null);
	let removeImageButton = $state<HTMLButtonElement | null>(null);
	let carouselRef = $state<{
		exportAllCards: (options?: { allowFallbackFonts?: boolean }) => Promise<void>;
	} | null>(null);

	const themes: {
		value: Theme;
		label: string;
		description: string;
	}[] = [
		{ value: 'neon', label: 'Neon', description: 'Cyberpunk' },
		{ value: 'minimalist', label: 'Minimal', description: 'Swiss' },
		{ value: 'retro', label: 'Retro', description: '8-bit' }
	];

	async function handleExport(allowFallbackFonts = false) {
		if (appStore.isExporting) return;
		if (!carouselRef) {
			exportError = { message: 'Export component not ready', fontsUnavailable: false };
			return;
		}

		appStore.isExporting = true;
		exportError = null;
		exportStatus = 'Generating images...';

		try {
			await carouselRef.exportAllCards({ allowFallbackFonts });
			exportStatus = 'Downloaded three images';
		} catch (error) {
			exportStatus = '';
			exportError = {
				message: error instanceof Error ? error.message : 'Failed to export',
				fontsUnavailable: error instanceof FontsUnavailableError
			};
		} finally {
			appStore.isExporting = false;
		}
	}

	function setTheme(theme: Theme) {
		appStore.theme = theme;
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
			await showAvatarError('Please upload an image file');
			return;
		}

		const dataUrl = await loadImageDataUrl(file);
		if (!dataUrl) {
			await showAvatarError('That file could not be read as an image');
			return;
		}

		avatarError = null;
		appStore.userPfp = dataUrl;
		// The file input is replaced by the preview, which would drop focus to the page.
		await tick();
		removeImageButton?.focus();
	}

	async function showAvatarError(message: string) {
		// Re-inserting the alert makes screen readers announce a repeated message again.
		avatarError = null;
		await tick();
		avatarError = message;
	}

	async function removeImage() {
		appStore.userPfp = null;
		await tick();
		avatarInput?.focus();
	}
</script>

<section class="export-panel" id="export-panel">
	<div class="mb-8 flex items-end gap-4">
		<h2 class="text-3xl font-bold tracking-tight">Export</h2>
		<div
			class="mb-2 h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20"
		></div>
	</div>

	<!-- Controls Row -->
	<div class="flex flex-col items-start gap-8 lg:flex-row">
		<!-- Left: Controls -->
		<div class="w-full shrink-0 space-y-6 lg:w-80">
			<!-- Name Input -->
			<div>
				<label for="userName" class="mb-2 block text-sm font-medium text-zinc-400">
					Your Name (optional)
				</label>
				<input
					type="text"
					id="userName"
					autocomplete="name"
					bind:value={appStore.userName}
					maxlength={USER_NAME_MAX_LENGTH}
					disabled={appStore.isExporting}
					placeholder="César"
					class="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[var(--color-surface-elevated)] px-4 py-3 text-white placeholder-zinc-400 transition-colors focus:border-[var(--color-accent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>

			<!-- Profile Picture Upload -->
			<div>
				<label for="userAvatar" class="mb-2 block text-sm font-medium text-zinc-400">
					Profile Picture (optional)
				</label>
				{#if appStore.userPfp}
					<div
						class="flex items-center gap-4 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[var(--color-surface-elevated)] p-3"
					>
						<img
							src={appStore.userPfp}
							alt="Preview"
							class="h-12 w-12 rounded-full border border-white/10 object-cover"
						/>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs text-zinc-400">Custom pfp active</p>
						</div>
						<button
							bind:this={removeImageButton}
							onclick={removeImage}
							disabled={appStore.isExporting}
							class="p-2 text-zinc-400 transition-colors enabled:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
							title="Remove image"
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
							disabled={appStore.isExporting}
							onchange={handleImageUpload}
							aria-describedby={avatarError ? 'userAvatar-error' : undefined}
							class="peer sr-only"
						/>
						<label
							for="userAvatar"
							class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-[rgba(255,255,255,0.2)] bg-[var(--color-surface-elevated)] px-4 py-3 text-zinc-400 transition-all peer-focus-visible:border-[var(--color-accent)] peer-focus-visible:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--color-accent)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-enabled:hover:border-[var(--color-accent)] peer-enabled:hover:text-white"
						>
							<ImageIcon class="h-5 w-5" aria-hidden="true" />
							<span class="text-sm font-medium">Upload Image</span>
						</label>
					</div>
				{/if}
				{#if avatarError}
					<p id="userAvatar-error" role="alert" class="mt-2 text-sm text-red-400">{avatarError}</p>
				{/if}
			</div>

			<!-- Summary Metric Selector -->
			<div>
				<span id="summary-metric-label" class="mb-2 block text-sm font-medium text-zinc-400">
					Focused Stat (Summary Card)
				</span>
				<div role="group" aria-labelledby="summary-metric-label" class="grid grid-cols-2 gap-2">
					{#each [{ value: 'distance', label: 'Distance', icon: Ruler }, { value: 'elevation', label: 'Elevation', icon: Mountains }, { value: 'duration', label: 'Time', icon: Timer }, { value: 'calories', label: 'Calories', icon: Fire }] as metric (metric.value)}
						<button
							onclick={() => (appStore.summaryMetric = metric.value as SummaryMetric)}
							aria-pressed={appStore.summaryMetric === metric.value}
							disabled={appStore.isExporting}
							class="flex items-center justify-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 {appStore.summaryMetric ===
							metric.value
								? 'bg-[var(--color-accent)] font-semibold text-[var(--color-surface)] forced-colors:outline-2 forced-colors:outline-offset-2'
								: 'bg-[var(--color-surface-elevated)] text-zinc-400 enabled:hover:bg-[var(--color-surface-hover)] enabled:hover:text-white'}"
						>
							<metric.icon class="h-4 w-4" aria-hidden="true" />
							<span class="text-sm font-bold">{metric.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Theme Selector -->
			<div>
				<span id="theme-label" class="mb-2 block text-sm font-medium text-zinc-400">Theme</span>
				<div role="group" aria-labelledby="theme-label" class="flex gap-2">
					{#each themes as theme (theme.value)}
						<button
							onclick={() => setTheme(theme.value)}
							aria-pressed={appStore.theme === theme.value}
							disabled={appStore.isExporting}
							class="flex-1 rounded-lg px-4 py-3 text-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 {appStore.theme ===
							theme.value
								? 'bg-[var(--color-accent)] font-semibold text-[var(--color-surface)] forced-colors:outline-2 forced-colors:outline-offset-2'
								: 'bg-[var(--color-surface-elevated)] text-zinc-400 enabled:hover:bg-[var(--color-surface-hover)] enabled:hover:text-white'}"
						>
							<div class="text-sm font-bold">{theme.label}</div>
							<div class="text-xs">
								{theme.description}
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- aria-disabled instead of disabled keeps focus on the button while exporting. -->
			<button
				id="export-download"
				onclick={() => handleExport()}
				aria-disabled={appStore.isExporting}
				class="btn-primary flex w-full items-center justify-center gap-3 text-lg aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
			>
				{#if appStore.isExporting}
					<span class="animate-spin" aria-hidden="true">⏳</span>
					Generating...
				{:else}
					<DownloadSimple class="h-5 w-5" weight="bold" aria-hidden="true" />
					Download All Images
				{/if}
			</button>

			<p id="export-status" role="status" class="sr-only">{exportStatus}</p>
			<div id="export-error" role="alert" class="empty:hidden">
				{#if exportError}
					<p class="text-sm text-red-400">{exportError.message}</p>
					{#if exportError.fontsUnavailable}
						<button
							onclick={() => handleExport(true)}
							class="mt-2 text-sm font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-white"
						>
							Export with fallback fonts
						</button>
					{/if}
				{/if}
			</div>

			<p class="text-xs text-zinc-400">
				Downloads three images: Summary, Breakdown, and Highlights
			</p>
		</div>

		<!-- Right: Preview -->
		<div class="preview-container flex w-full flex-1 flex-col items-center">
			<div class="mb-4 text-sm text-zinc-400">Preview</div>
			<div class="preview-wrapper">
				<ExportCarousel bind:this={carouselRef} />
			</div>
		</div>
	</div>
</section>

<style>
	.export-panel {
		padding-top: 2rem;
		margin-top: 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.preview-wrapper {
		width: 100%;
		max-width: 400px;
	}
</style>
