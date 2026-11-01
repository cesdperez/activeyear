<script lang="ts">
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
			class="text-[44px] font-bold tracking-widest whitespace-nowrap text-[var(--color-text-primary)] uppercase"
		>
			Personal Records
		</p>
		<div
			class="h-1 flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-30"
		></div>
	</div>

	<div class="grid grid-cols-3 gap-6">
		<RecordCards {records} {unit} variant="export" />
	</div>
</div>
