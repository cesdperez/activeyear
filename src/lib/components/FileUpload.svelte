<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte.js';

	let isDragOver = $state(false);
	let fileInput: HTMLInputElement;

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const file = event.dataTransfer?.files[0];
		if (file) {
			await appStore.processFile(file);
		}
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			await appStore.processFile(file);
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div
	class="upload-zone p-8 md:p-12 cursor-pointer"
	class:dragover={isDragOver}
	role="button"
	tabindex="0"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={triggerFileInput}
	onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
>
	<input
		bind:this={fileInput}
		type="file"
		accept=".csv"
		class="hidden"
		onchange={handleFileSelect}
		id="file-upload"
	/>

	<div class="text-center">
		{#if appStore.status === 'parsing'}
			<div class="mb-4">
				<svg
					class="w-12 h-12 mx-auto text-cyan-400 animate-spin"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			</div>
			<p class="text-lg text-zinc-400">Analyzing activities...</p>
		{:else if appStore.status === 'error'}
			<div class="mb-4">
				<svg class="w-12 h-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			</div>
			<p class="text-lg text-red-400 mb-2">{appStore.error}</p>
			<p class="text-sm text-zinc-500">Click to try again</p>
		{:else}
			<div class="mb-4">
				<svg
					class="w-12 h-12 mx-auto text-zinc-500 group-hover:text-cyan-400 transition-colors"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
			</div>
			<p class="text-lg text-zinc-300 mb-1">
				Drop your Garmin CSV here
			</p>
			<p class="text-sm text-zinc-500 mb-4">
				or click to browse
			</p>
			<p class="text-xs text-zinc-600 flex items-center justify-center gap-1">
				<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
				Your data never leaves this browser
			</p>
		{/if}
	</div>
</div>
