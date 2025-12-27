<script lang="ts">
	import { appStore } from "$lib/stores/app.svelte.js";
	import {
		Upload,
		AlertTriangle,
		Loader2,
		ShieldCheck,
	} from "@lucide/svelte";

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
	class="upload-zone p-8 md:p-12 cursor-pointer group"
	class:dragover={isDragOver}
	role="button"
	tabindex="0"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={triggerFileInput}
	onkeydown={(e) => e.key === "Enter" && triggerFileInput()}
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
		{#if appStore.status === "parsing"}
			<div class="mb-4">
				<Loader2
					class="w-12 h-12 mx-auto text-[var(--color-accent)] animate-spin"
					strokeWidth={1.5}
				/>
			</div>
			<p class="text-lg text-[var(--color-text-muted)]">
				Analyzing activities...
			</p>
		{:else if appStore.status === "error"}
			<div class="mb-4">
				<AlertTriangle
					class="w-12 h-12 mx-auto text-red-500"
					strokeWidth={1.5}
				/>
			</div>
			<p class="text-lg text-red-500 mb-2">{appStore.error}</p>
			<p class="text-sm text-[var(--color-text-dim)]">
				Click to try again
			</p>
		{:else}
			<div class="mb-4">
				<Upload
					class="w-12 h-12 mx-auto text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors duration-300"
					strokeWidth={1.5}
				/>
			</div>
			<p class="text-lg text-[var(--color-text-primary)] mb-1">
				Drop your Garmin CSV here
			</p>
			<p class="text-sm text-[var(--color-text-muted)] mb-4">
				or click to browse
			</p>
			<p
				class="text-xs text-[var(--color-text-dim)] flex items-center justify-center gap-1.5"
			>
				<ShieldCheck class="w-3.5 h-3.5" strokeWidth={2} />
				Your data never leaves this browser
			</p>
		{/if}
	</div>
</div>
