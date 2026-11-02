<script lang="ts">
	import { onMount } from 'svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { UPLOAD_ZONE_ID } from '#lib/constants/dom.js';
	import { UploadSimple, Warning, SpinnerGap, ShieldCheck } from 'phosphor-svelte';

	let { loading = $bindable(false) }: { loading?: boolean } = $props();

	let isDragOver = $state(false);
	let fileInput: HTMLInputElement;
	let currentPhrase = $state('');
	// Controls cannot respond before hydration, so present them as disabled until then.
	let hydrated = $state(false);

	onMount(() => {
		hydrated = true;
	});

	const FUNNY_PHRASES = [
		'Warming up the calves...',
		'Inflating the tires...',
		'Finding the GPS signal...',
		'Chasing down segments...',
		'Hydrating the data...',
		'Lacing up the shoes...',
		'Greasing the chain...',
		'Stretching the glutes...',
		'Calculating VO2 max...',
		'Eating a pre-run banana...',
		'Tightening the cleats...',
		'Checking the wind direction...',
		'Refilling the water bottles...',
		'Syncing with the satellites...',
		'Polishing the frame...',
		'Adjusting the saddle height...',
		'Loading the power meter...',
		'Applying anti-chafe cream...',
		'Checking the weather forecast...',
		'Calibrating the heart rate monitor...'
	];

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (loading) {
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'none';
			return;
		}
		isDragOver = true;
	}

	function isFileDrag(event: DragEvent) {
		return event.dataTransfer?.types.includes('Files') ?? false;
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
		return FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)];
	}

	async function upload(file: File) {
		if (loading || !hydrated) return;
		loading = true;
		currentPhrase = randomPhrase();
		const phraseInterval = setInterval(() => (currentPhrase = randomPhrase()), 1000);
		try {
			await appStore.processFile(file);
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
		if (!loading && hydrated) fileInput?.click();
	}
</script>

<svelte:window ondragover={blockFileDropOutsideZone} ondrop={blockFileDropOutsideZone} />

<input
	bind:this={fileInput}
	type="file"
	accept=".csv"
	class="hidden"
	onchange={handleFileSelect}
	id="file-upload"
/>

<button
	type="button"
	id={UPLOAD_ZONE_ID}
	class="upload-zone group flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center p-8 text-center aria-disabled:cursor-not-allowed md:p-12"
	class:dragover={isDragOver}
	aria-disabled={loading || !hydrated}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={triggerFileInput}
>
	{#if loading}
		<span class="mb-4 block">
			<SpinnerGap
				class="mx-auto h-12 w-12 animate-spin text-[var(--color-accent)]"
				weight="bold"
				aria-hidden="true"
			/>
		</span>
		<span class="block animate-pulse text-lg text-[var(--color-text-muted)]">
			{currentPhrase}
		</span>
	{:else if appStore.status === 'error'}
		<span class="mb-4 block">
			<Warning class="mx-auto h-12 w-12 text-red-500" weight="bold" aria-hidden="true" />
		</span>
		<span class="mb-2 block text-lg text-red-500">{appStore.error}</span>
		<span class="block text-sm text-[var(--color-text-dim)]">Click to try again</span>
	{:else}
		<span class="mb-4 block">
			<UploadSimple
				class="mx-auto h-12 w-12 text-[var(--color-text-dim)] transition-colors duration-300 group-hover:text-[var(--color-accent)]"
				weight="bold"
				aria-hidden="true"
			/>
		</span>
		<span class="mb-1 block text-lg text-balance text-[var(--color-text-primary)]"
			>Drop your Garmin CSV here</span
		>
		<span class="mb-4 block text-sm text-[var(--color-text-muted)]">or click to browse</span>
		<span class="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-dim)]">
			<ShieldCheck class="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
			Your data never leaves this browser
		</span>
	{/if}
</button>

<!-- A button's children are presentational, so live regions must sit outside it. -->
<p role="status" class="sr-only">{loading ? 'Analyzing activities...' : ''}</p>
<p role="alert" class="sr-only">{!loading && appStore.status === 'error' ? appStore.error : ''}</p>
