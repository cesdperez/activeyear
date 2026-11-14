<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { DownloadSimple } from 'phosphor-svelte';
	import { SAVED_YEAR_URL_REVOKE_DELAY_MS } from '#lib/constants/savedYear.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { yearData } from '#lib/stores/yearData.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { savedYearFileName } from '#lib/utils/savedYear.js';

	function saveYear() {
		const url = URL.createObjectURL(
			new Blob([yearData.savedYearJson()], { type: 'application/json' })
		);
		const link = document.createElement('a');
		link.href = url;
		link.download = savedYearFileName(TARGET_YEAR);
		link.click();
		// Safari needs time to start the download before the URL is revoked.
		setTimeout(() => URL.revokeObjectURL(url), SAVED_YEAR_URL_REVOKE_DELAY_MS);
	}
</script>

<div class="w-full text-center">
	<button
		type="button"
		class="btn-secondary w-full justify-center"
		disabled={exportLock.isExporting}
		onclick={saveYear}
	>
		<DownloadSimple class="h-4 w-4" weight="bold" aria-hidden="true" />
		{i18n.m.dashboard.saveMyYear}
	</button>
	<p class="mt-2 text-xs text-[var(--color-text-dim)]">
		{i18n.m.dashboard.reopenRecap}
	</p>
</div>
