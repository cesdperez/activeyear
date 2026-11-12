<script lang="ts">
	import { DownloadSimple } from 'phosphor-svelte';
	import { SAVED_YEAR_URL_REVOKE_DELAY_MS } from '#lib/constants/savedYear.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { savedYearFileName } from '#lib/utils/savedYear.js';

	function saveYear() {
		const url = URL.createObjectURL(
			new Blob([appStore.savedYearJson()], { type: 'application/json' })
		);
		const link = document.createElement('a');
		link.href = url;
		link.download = savedYearFileName(TARGET_YEAR);
		link.click();
		// Safari needs time to start the download before the URL is revoked.
		setTimeout(() => URL.revokeObjectURL(url), SAVED_YEAR_URL_REVOKE_DELAY_MS);
	}
</script>

<div class="mt-24 -mb-20 text-center">
	<button
		type="button"
		class="inline-flex items-center gap-2 rounded-lg border border-[var(--color-text-dim)] px-6 py-3 text-sm font-medium text-zinc-400 transition-all duration-300 enabled:hover:bg-[var(--color-surface-elevated)] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
		disabled={appStore.isExporting}
		onclick={saveYear}
	>
		<DownloadSimple class="h-4 w-4" weight="bold" aria-hidden="true" />
		Save my year
	</button>
	<p class="mt-2 text-xs text-[var(--color-text-muted)]">
		Reopen this recap later without exporting again
	</p>
</div>
