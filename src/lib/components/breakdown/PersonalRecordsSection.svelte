<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import type { PersonalRecords, Unit } from '#lib/types/index.js';
	import RecordCards from '#lib/components/widgets/RecordCards.svelte';

	let { records, unit }: { records: PersonalRecords; unit: Unit } = $props();
</script>

<div class="mb-auto">
	<div class="mb-6 flex items-center gap-6">
		<div
			class="h-1 flex-1 bg-gradient-to-l from-[var(--color-accent)] to-transparent opacity-30"
		></div>
		<p
			class="min-w-0 text-center text-[44px] font-bold tracking-widest text-balance wrap-anywhere text-[var(--color-text-primary)] uppercase"
		>
			{i18n.m.dashboard.personalRecords}
		</p>
		<div
			class="h-1 flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-30"
		></div>
	</div>

	<div class="grid grid-cols-3 gap-6">
		<RecordCards {records} {unit} variant="export" theme={appStore.theme} />
	</div>
</div>
