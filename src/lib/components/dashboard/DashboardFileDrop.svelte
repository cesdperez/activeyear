<script lang="ts">
	import { uploadStore } from '#lib/stores/upload.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { isFileDrag } from '#lib/components/fileDrag.js';
	import { startOver } from './startOver.js';

	// Without this, a file dropped on the dashboard makes the browser open it and the year is lost.
	function acceptFileDrag(event: DragEvent) {
		if (!isFileDrag(event)) return;
		event.preventDefault();
		if (event.dataTransfer)
			event.dataTransfer.dropEffect = exportLock.isExporting ? 'none' : 'copy';
	}

	async function loadDroppedFile(event: DragEvent) {
		if (!isFileDrag(event)) return;
		event.preventDefault();
		const file = event.dataTransfer?.files[0];
		if (!file || exportLock.isExporting) return;
		await startOver();
		await uploadStore.processFile(file);
	}
</script>

<svelte:window ondragover={acceptFileDrag} ondrop={loadDroppedFile} />
