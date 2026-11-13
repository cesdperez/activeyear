<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { uploadErrorMessage } from '#lib/utils/uploadErrors.js';
	import { uploadStore } from '#lib/stores/upload.svelte.js';
	import { createHydrated } from '#lib/stores/hydrated.svelte.js';
	import { UPLOAD_ZONE_ID } from '#lib/constants/dom.js';
	import { isFileDrag } from './fileDrag.js';
	import { MIN_UPLOAD_LOADING_MS } from '#lib/constants/time.js';
	import { UploadSimple, Warning, SpinnerGap, ShieldCheck } from 'phosphor-svelte';

	let { loading = $bindable(false) }: { loading?: boolean } = $props();

	let isDragOver = $state(false);
	let fileInput: HTMLInputElement;
	let currentPhrase = $state(0);
	const hydrated = createHydrated();

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (loading) {
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'none';
			return;
		}
		isDragOver = true;
	}

	// Without this, a file dropped beside the zone makes the browser open or download it.
	function blockFileDropOutsideZone(event: DragEvent) {
		if (!isFileDrag(event) || event.defaultPrevented) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'none';
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	function randomPhrase() {
		return Math.floor(Math.random() * i18n.m.upload.loading.length);
	}

	async function upload(file: File) {
		if (loading || !hydrated.current) return;
		loading = true;
		currentPhrase = randomPhrase();
		const phraseInterval = setInterval(() => (currentPhrase = randomPhrase()), 1000);
		try {
			await Promise.all([
				uploadStore.processFile(file),
				new Promise((resolve) => setTimeout(resolve, MIN_UPLOAD_LOADING_MS))
			]);
		} finally {
			clearInterval(phraseInterval);
			loading = false;
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const file = event.dataTransfer?.files[0];
		if (file) upload(file);
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		// Without the reset, picking the same file again after an error fires no change event.
		target.value = '';
		if (file) upload(file);
	}

	function triggerFileInput() {
		if (!loading && hydrated.current) fileInput?.click();
	}
</script>

<svelte:window ondragover={blockFileDropOutsideZone} ondrop={blockFileDropOutsideZone} />

<input
	bind:this={fileInput}
	type="file"
	accept=".csv,.json"
	class="hidden"
	onchange={handleFileSelect}
	id="file-upload"
/>

<button
	type="button"
	id={UPLOAD_ZONE_ID}
	class="upload-zone group flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center p-8 text-center aria-disabled:cursor-not-allowed md:p-12"
	class:dragover={isDragOver}
	aria-disabled={loading || !hydrated.current}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={triggerFileInput}
>
	{#if loading}
		<span class="mb-4 block">
			<SpinnerGap
				class="h-12 w-12 animate-spin text-[var(--color-accent)]"
				weight="bold"
				aria-hidden="true"
			/>
		</span>
		<span class="block animate-pulse text-lg text-[var(--color-text-muted)]">
			{i18n.m.upload.loading[currentPhrase % i18n.m.upload.loading.length]}
		</span>
	{:else if uploadStore.status === 'error'}
		<span class="mb-4 block">
			<Warning
				class="h-12 w-12 text-[var(--color-text-primary)]"
				weight="bold"
				aria-hidden="true"
			/>
		</span>
		<span class="mb-2 block text-lg text-balance text-[var(--color-text-primary)]"
			>{uploadStore.error ? uploadErrorMessage(uploadStore.error, i18n.locale) : ''}</span
		>
		<span class="block text-sm text-[var(--color-text-dim)]">{i18n.m.upload.retry}</span>
	{:else}
		<span class="mb-4 block">
			<UploadSimple
				class="h-10 w-10 text-[var(--color-text-dim)] transition-colors duration-200 group-hover:text-[var(--color-accent)]"
				weight="bold"
				aria-hidden="true"
			/>
		</span>
		<span class="mb-1 block text-xl font-semibold text-balance text-[var(--color-text-primary)]"
			>{i18n.m.upload.drop}</span
		>
		<span class="mb-4 block text-sm text-[var(--color-text-muted)]">{i18n.m.upload.browse}</span>
		<span class="mb-4 block text-xs text-[var(--color-text-dim)]">{i18n.m.upload.saved}</span>
		<span class="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
			<ShieldCheck class="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
			{i18n.m.upload.privacy}
		</span>
	{/if}
</button>

<!-- A button's children are presentational, so live regions must sit outside it. -->
<p role="status" class="sr-only">{loading ? i18n.m.upload.analyzing : ''}</p>
<p role="alert" class="sr-only">
	{!loading && uploadStore.status === 'error'
		? uploadStore.error && uploadErrorMessage(uploadStore.error, i18n.locale)
		: ''}
</p>
